import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

async function checkAPIKey() {
    console.log('Checking Gemini API Key validity...');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.log('❌ No GEMINI_API_KEY found in environment');
        return;
    }

    console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
    console.log('Key length:', apiKey.length);

    // Check if key starts with correct prefix
    if (!apiKey.startsWith('AIza')) {
        console.log('⚠️  Warning: API key doesn\'t start with "AIza" - this might not be a valid Gemini API key');
    } else {
        console.log('✅ API key format looks correct');
    }

    // Try to make a direct HTTP request to list models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ API Key is valid!');
            console.log('Available models:');
            if (data.models) {
                data.models.forEach(model => {
                    console.log(`  - ${model.name}`);
                    if (model.name.includes('generateContent')) {
                        console.log(`    ✅ Supports generateContent`);
                    }
                });
            }
        } else {
            console.log('❌ API Key validation failed:', data.error?.message || 'Unknown error');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ Error checking API key:', error.message);
    }
}

checkAPIKey();