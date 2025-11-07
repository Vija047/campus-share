// Test script to verify email configuration
import dotenv from 'dotenv';
import { sendEmail } from './utils/email.js';

// Load environment variables
dotenv.config();

const testEmail = async () => {
    console.log('Testing email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

    try {
        const result = await sendEmail({
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'Test Email - Campus Share',
            html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify the email configuration is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
        });

        if (result.error) {
            console.error('❌ Email test failed:', result.error);
            console.error('Error code:', result.code);
        } else if (result.skipped) {
            console.warn('⚠️ Email test skipped:', result.messageId);
        } else {
            console.log('✅ Email test successful!');
            console.log('Message ID:', result.messageId);
        }
    } catch (error) {
        console.error('❌ Email test error:', error.message);
    }

    process.exit(0);
};

testEmail();