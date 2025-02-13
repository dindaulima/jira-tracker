// Construct the message
// INI BELUM SELESAI

// Function to query Ollama using fetch
async function queryOllama(model, prompt) {
    const url = 'http://localhost:11434/api/chat'; // Ollama API endpoint
    const data = {
        model: model,
        messages: [{ role: 'user', content: prompt }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result.message.content;
    } catch (error) {
        console.error('Error querying Ollama:', error);
        throw error;
    }
}

// Main function
async function runModel() {
    const modelName = "deepseek-r1:8b"; // Change this to the model you downloaded
    const userPrompt = message;
    const result = await queryOllama(modelName, userPrompt);
    console.log("Response:\n", result);
}

// Run the main function
runModel().catch(console.error);