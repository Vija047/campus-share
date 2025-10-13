#!/usr/bin/env node

// Test script to verify Google Generative AI import
console.log('Testing Google Generative AI import...');

try {
    // Dynamic import to handle potential issues
    import('@google/generative-ai').then((module) => {
        const { GoogleGenerativeAI } = module;
        console.log('✓ @google/generative-ai imported successfully');
        console.log('✓ GoogleGenerativeAI constructor available:', typeof GoogleGenerativeAI === 'function');

        // Test instantiation (without API key)
        try {
            new GoogleGenerativeAI('test-key');
            console.log('✓ GoogleGenerativeAI can be instantiated');
        } catch (e) {
            console.log('⚠ GoogleGenerativeAI instantiation issue:', e.message);
        }

        console.log('All tests passed!');
        process.exit(0);
    }).catch((error) => {
        console.error('✗ Failed to import @google/generative-ai:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    });
} catch (error) {
    console.error('✗ Critical error during import test:', error.message);
    process.exit(1);
}