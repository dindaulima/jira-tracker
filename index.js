import { getIssuesUpdatedRecently, getDetailIssue, updateJiraIssue} from './api/jiraClient.js';
import { getCustomFields, getSelectedFields, formatTestCase, extractQAFeedback} from './utils/dataProcessor.js';

async function main() {

    // get all jira that were updated yesterday
    const issues = await getIssuesUpdatedRecently();
    const myCustomFields = getCustomFields(["acceptance-criteria","test-case", "qa-feedback","complete-documentation"]);

    // track each issue
    for (const issue of issues) {

        let updatefields = {}

        // get detail issue 
        let jiraData = await getDetailIssue(issue.key);


        // get selected fields
        let jiraDataPruned = getSelectedFields(jiraData, myCustomFields);

        // skipped issue without custom field test case -> Jika tidak ada test case maka bukan card untuk QA
        if(jiraDataPruned['Test Case'] === undefined){
            continue;
        }

        let completeDocumentation = 0;

        console.log(`Issue: ${issue.key}`);

        // Process test case
        if(jiraDataPruned['Test Case'].value){

            let formattedTestCase = formatTestCase(jiraDataPruned['Test Case'].value.content[0].content);
            console.log(formattedTestCase);
            //count the test case
            let totalTestCase = formattedTestCase.length;
            let completedTestCase = 0;

            //count complete documentation
            for (const testcases of formattedTestCase) {
                let testcase = testcases.TestCase;
                if(testcase['Precondition'] == '' || testcase['Precondition'] == '-'){ 
                    continue;
                }
                if(testcase['Test Data'] == '' || testcase['Test Data'] == '-'){ 
                    continue;
                }
                if(testcase['Steps'] == '' || testcase['Steps'] == '-'){ 
                    continue;
                }
                if(testcase['Expected Result'] == '' || testcase['Expected Result'] == '-'){ 
                    continue;
                }
                
                completedTestCase++;
            
            }

            completeDocumentation = totalTestCase === 0 ? 0 : (completedTestCase / totalTestCase);
            console.log(`Total Test Case:${totalTestCase} | Total Test Case with Complete Documentation: ${completedTestCase} | Rate Complete Documentation: ${completeDocumentation}`);

            // count coverage testing
            let mainFeatures = formattedTestCase.filter(row => row.Priority.toLowerCase() == "must have");
            let totalMainFeatures = mainFeatures.length;
            let cntMainFeaturesTested = mainFeatures.filter(row => row.Status.toLowerCase() == "passed").length;
            let progressTesting = totalMainFeatures === 0 ? 0 : (cntMainFeaturesTested / totalMainFeatures);

            console.log(`Total Main Features:${totalMainFeatures} | Total Main Features Tested: ${cntMainFeaturesTested} | Progress Testing: ${progressTesting}`);
        }

        // Process QA Feedback ---> Bug found during development
        if(jiraDataPruned['QA Feedback'].value){
            let formattedQAFeedback = extractQAFeedback(jiraDataPruned['QA Feedback'].value.content[0].content);

            // count total bug development
            let bugDevelopment = formattedQAFeedback.filter(row => row.Tipe.toLowerCase() == "bug");
            let totalBug = bugDevelopment.length;
            let totalBugFixed = bugDevelopment.filter(row => row.Status.toLowerCase() == "fixed").length;
            let progressBugFixing = totalBug === 0 ? 0 : (totalBugFixed / totalBug);

            console.log(`Total Bug Found During Development:${totalBug} | Total Bug Fixed: ${totalBugFixed} | Progress Bug Fixing: ${progressBugFixing}`);

        }

        // update jira field
        if(completeDocumentation*100 != jiraDataPruned['Complete Documentation'].value){
            //panggil fungsi jira update
        }



    }

}

main();