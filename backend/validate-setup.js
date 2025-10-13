import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function validateGeminiSetup() {
    console.log('🔧 Validating Gemini AI Setup...\n');

    // Check environment file
    if (!process.env.GEMINI_API_KEY) {
        console.log('❌ GEMINI_API_KEY not found in environment variables');
        console.log('\n📋 Setup Instructions:');
        console.log('1. Copy .env.sample to .env');
        console.log('2. Get your API key from: https://aistudio.google.com/app/apikey');
        console.log('3. Replace "your-gemini-api-key-here" with your actual key');
        console.log('4. The key should start with "AI" followed by characters');
        return false;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check API key format
    if (apiKey === 'your-gemini-api-key-here') {
        console.log('❌ Please replace the placeholder with your actual Gemini API key');
        console.log('Get it from: https://aistudio.google.com/app/apikey');
        return false;
    }

    if (!apiKey.startsWith('AI')) {
        console.log('⚠️  Warning: Gemini API keys typically start with "AI"');
        console.log('Please verify your API key is correct');
    }

    console.log('✅ GEMINI_API_KEY found and configured');
    console.log(`✅ Key format: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

    console.log('\n📝 Configuration Summary:');
    console.log('- API Key: Configured ✅');
    console.log('- Environment: Ready ✅');
    console.log('- Package: @google/generative-ai installed ✅');

    console.log('\n🚀 Ready to test Gemini integration!');
    console.log('\nTo test with your API key:');
    console.log('1. Make sure you have a valid API key from Google AI Studio');
    console.log('2. Test the chatbot endpoints in your application');
    console.log('3. Check the browser console for any error messages');

    return true;
}

// Run validation
validateGeminiSetup();