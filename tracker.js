import { start } from 'repl';
import { getMonthlyJiraIssues, getDetailIssue} from './api/jiraClient.js';
import { saveDataToFile, getCustomFields, getSelectedFields, formatTestCase, extractQAFeedback} from './utils/dataProcessor.js';
import fs from 'fs';
monthlyReport();

async function monthlyReport() {

    const DocumentationFields = getCustomFields("documentation");
    const AssigneeField = getCustomFields("assignee");
    const mycustomFields = [...DocumentationFields, ...AssigneeField];
    
    const startDate = "2025-05-01";
    const endDate = "2025-05-31";
    let issuePruned = [];
    // getMonthlyJiraIssues(startDate, endDate);

    const issues = JSON.parse(fs.readFileSync('data/jira-monthly-issues.json', 'utf8'));

    for (const issue of issues) {
        // console.log(`Processing issue: ${issue.key}`);
        // get selected fields
        issuePruned = getSelectedFields(issue,mycustomFields);
    }

    console.log(issuePruned);
}