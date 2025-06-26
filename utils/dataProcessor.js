import fs from 'fs';
import { get } from 'http';
import path  from 'path';

//function to get selected fields
export function getCustomFields(type="all") {

  const allfields = JSON.parse(fs.readFileSync('./data/all-fields.json', 'utf8'));

  if(type === "all") {
    return allfields;
  } else if(type === "documentation") {
    return getDocumentationfields();
  } else if(type === "assignee") {
    return getAssigneeFields();
  }

  return null;

}

export function getDocumentationfields() {

    const allfields = JSON.parse(fs.readFileSync('./data/all-fields.json', 'utf8'));
    const fieldsTestCase = allfields.filter(item => item.name.toLowerCase().includes("test case"));
    const fieldsAcceptanceCriteria = allfields.filter(item => item.name.toLowerCase().includes("acceptance criteria"));
    const fieldQAFeedback = allfields.filter(item => item.name.toLowerCase().includes("qa feedback"));
    const fieldCompleteDocumentation = allfields.filter(item => item.name.toLowerCase().includes("complete documentation"));

    let fields = [];

    fields = fields.concat(fieldsAcceptanceCriteria);
    fields = fields.concat(fieldsTestCase);
    fields = fields.concat(fieldQAFeedback);
    fields = fields.concat(fieldCompleteDocumentation);

    return fields;
}

export function getAssigneeFields() {

    const allfields = JSON.parse(fs.readFileSync('./data/all-fields.json', 'utf8'));
    const assignee1 = allfields.filter(item => item.name.toLowerCase().includes("assignee"));
    const assignee2 = allfields.filter(item => item.name.toLowerCase().includes("assignee qa"));
    const assignee3 = allfields.filter(item => item.name.toLowerCase().includes("qa/tester"));
    const assignee4 = allfields.filter(item => item.name.toLowerCase().includes("tester/qa"));
    const assignee5 = allfields.filter(item => item.name.toLowerCase().includes("qa"));


    let fields = [];
    fields = fields.concat(assignee1);
    fields = fields.concat(assignee2);
    fields = fields.concat(assignee3);
    fields = fields.concat(assignee4);
    fields = fields.concat(assignee5);

    return fields;
}

export function getSelectedFields(data, myCustomFields = []) {
  const standardFields = ["summary", "description", "status", "assignee", "created", "updated"];

  const fields = data.fields;
 
  // Extract standard fields dynamically
  const filteredData = {};
  filteredData.key = data.key;
  standardFields.forEach(field => {
      if (fields[field] !== undefined) {
          filteredData[field] = fields[field];
      }
  });
  
  // Extract custom fields dynamically
  myCustomFields.forEach(field => {
    if (fields[field.key] !== undefined) {
        let temp = {};
        temp.key = field.key; // Custom field key dibutuhkan untuk proses update data
        temp.value = fields[field.key];
        filteredData[field.name] = temp;
    }
  });

  return filteredData;
}

// Helper function to extract text from a cell
const extractText = (cell) => {
    return cell.content
        .map(paragraph => {
            if (paragraph.type === "paragraph" && paragraph.content) {
                return paragraph.content.map(textObj => textObj.text).join(" ");
            } else if (paragraph.type === "bulletList" || paragraph.type === "orderedList") {
                return paragraph.content.map(listItem =>
                    listItem.content.map(para =>
                        para.content ? para.content.map(textObj => textObj.text).join(" ") : ""
                    ).join("\n")
                ).join("\n");
            }
            return "";
        })
        .join("\n").trim();
};

// Function to extract and format the test case
export function formatTestCase(data) {
    try {
        // Extract table rows from JSON
        const tableRows = data.filter(row => row.type === "tableRow");

        if (!tableRows) {
            console.error("Data not found.");
            return [];
        }

        //skip the first row
        const dataRows = tableRows.slice(1);

        // Process rows into structured format
        const formattedData = dataRows.map(row => {
            const cells = row.content.map(extractText);

            const testCaseOriginal = cells[1];

            // AI

            // Manual
                // Extracting test case details
                const testCaseDetails = {
                    "Precondition": '',
                    "Test Data": '',
                    "Steps": '',
                    "Expected Result": ''
                };


                const lines = cells[1].split("\n");
                let currentKey = null;

                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    const normalizedLine = trimmedLine.replace(/\s*:\s*$/, ":");

                    if (testCaseDetails.hasOwnProperty(normalizedLine.replace(":", ""))) {
                        currentKey = normalizedLine.replace(":", "");
                    } else if (currentKey) {
                        // Add line to the respective key, with proper formatting
                        testCaseDetails[currentKey] += `${testCaseDetails[currentKey] ? "\n" : ""}${normalizedLine}`;
                    }

                });

            return {
                No: cells[0],
                TestCase: testCaseDetails,
                // TestCase: testCaseOriginal,
                Evidence: cells[2],
                Priority: cells[3],
                Status: cells[4]
            };
        });
  
        return formattedData;
  
    } catch (error) {
        console.error("Error processing JSON:", error);
        return [];
    }
}

export function extractQAFeedback(data) {
    try {
        // Find the table structure
        const tableRows = data.filter(row => row.type === "tableRow");

        if (!tableRows) {
            console.error("Data not found.");
            return [];
        }

        //skip the first row
        const dataRows = tableRows.slice(1);

        // Extract table rows (skip the header row)
        const extractedData = dataRows.map(row => {
            const cells = row.content.map(extractText);

            return {
                No: cells[0] || "",
                Keterangan: cells[1] || "",
                Evidence: cells[2] === true, // Convert to boolean (true if media exists)
                Tipe: cells[3] || "",
                Status: cells[4] || ""
            };
        });

        return extractedData;

    } catch (error) {
        console.error("Error processing JSON:", error);
        return [];
    }
}

export function saveDataToFile(data, outputFolder='data', outputFile) {
    // Create the full path to the output file
    const outputPath = path.join(outputFolder, outputFile);

    // Check if the 'data' directory exists, and create it if it doesn't
    if (!fs.existsSync(outputFolder)) {
        console.log(`Creating directory: '${outputFolder}'`);
        fs.mkdirSync(outputFolder);
    }

    // Convert the array of issues to a human-readable JSON string
    // The 'null, 2' part formats the JSON nicely with an indentation of 2 spaces
    const jsonData = JSON.stringify(data, null, 2);

    // Write the JSON string to the file
    fs.writeFileSync(outputPath, jsonData);

    console.log(`Successfully saved all ${data.length} data to: ${outputPath}`);
}
