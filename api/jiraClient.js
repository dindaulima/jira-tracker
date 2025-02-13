import 'dotenv/config'; // Load environment variables

import fs from 'fs';

const JIRA_DOMAIN = process.env.JIRA_DOMAIN;

const USERNAME = process.env.JIRA_EMAIL;
const API_TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT = process.env.JIRA_PROJECT_KEY;


const AUTH = Buffer.from(`${USERNAME}:${API_TOKEN}`).toString('base64');

export async function getFieldName(){
    const API_ENDPOINT = '/rest/api/3/field';
    const FULL_URL = `${JIRA_DOMAIN}${API_ENDPOINT}`;

    try {
        const response = await fetch(FULL_URL, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${AUTH}`,
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        

        fields = data.map(field => ({
            key: field.key,
            name: field.name
        }));

        fs.writeFileSync("../data/all-fields.json", JSON.stringify(fields, null, 2), "utf8");
        console.log("✅ All fields data successfully saved to all-fields.json");

    } catch (error) {
        console.error("❌ Error fetching Jira data:", error);
    }
}

export async function getIssuesUpdatedRecently() {
    const API_ENDPOINT = `/rest/api/3/search?jql`;
    const CONDITION  = "updated >= -1d AND updated < 0d";
    const LIMIT = "&maxResults=1000"
    const FULL_URL = `${JIRA_DOMAIN}${API_ENDPOINT}=${PROJECT}`;

    try {
        const response = await fetch(`${FULL_URL} and  ${CONDITION} ${LIMIT}`, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${AUTH}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data.issues.map(issue => ({
            key: issue.key,                   // Jira issue key
            summary: issue.fields.summary,    // Issue title/summary
            status: issue.fields.status.name  // Status of the issue
        }));

    } catch (error) {
        console.error("❌ Error fetching Jira data:", error);
        return [];
    }
}

export async function getDetailIssue(issueIdOrKey) {
    const API_ENDPOINT = `/rest/api/3/issue/${issueIdOrKey}`;
    const FULL_URL = `${JIRA_DOMAIN}${API_ENDPOINT}`;

    try {
        const response = await fetch(FULL_URL, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${AUTH}`,
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;


    } catch (error) {
        console.error("❌ Error fetching Jira data:", error);
        return [];
    }
}

export async function updateJiraIssue (issueIdOrKey, fields){
    const API_ENDPOINT = `/rest/api/3/issue/${issueIdOrKey}`;
    const FULL_URL = `${JIRA_DOMAIN}${API_ENDPOINT}`;

    try {
        const response = await fetch(FULL_URL, {
            method: "PUT",
            headers: {
                "Authorization": `Basic ${AUTH}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fields }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${await response.text()}`);
        }

        console.log(`Issue ${issueIdOrKey} updated successfully`);
    } catch (error) {
        console.error("Error updating Jira issue:", error.message);
    }
}