const fs = require('fs');
const path = require('path');

// 1. Try to load API key from .env.production, .env, or env variables
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    const envFiles = ['.env', '.env.production'];
    for (const file of envFiles) {
        try {
            const envPath = path.join(__dirname, file);
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
                if (match) {
                    apiKey = match[1].trim();
                    console.log(`ℹ️ Loaded API Key from: ${file}`);
                    break;
                }
            }
        } catch (e) { }
    }
}

if (!apiKey || apiKey.startsWith('your_')) {
    console.error("❌ Error: Valid GEMINI_API_KEY not found in env variables, .env, or .env.production");
    process.exit(1);
}

// Masked API Key for safety
console.log(`🔑 Using API Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);

// Models to test
const models = [
    'gemini-3.5-flash-lite'
];

async function testModel(model) {
    console.log(`\n⏳ Testing model: ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello! Say: 'Confirming model <name> is working.'" }] }]
            })
        });

        const data = await response.json();
        if (response.ok) {
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                console.log(`✅ Success! Response: "${data.candidates[0].content.parts[0].text.trim()}"`);
            } else {
                console.error(`❌ Unexpected response shape: ${JSON.stringify(data)}`);
            }
        } else {
            console.error(`❌ Failed: HTTP ${response.status} - ${data.error ? data.error.message : JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error(`❌ Network Error: ${error.message}`);
    }
}

async function runTests() {
    for (const model of models) {
        await testModel(model);
    }
}

runTests();
