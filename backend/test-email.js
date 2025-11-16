// Test script to verify email configuration
import dotenv from 'dotenv';
import { sendEmail, sendEmailVerificationCode } from './utils/email.js';

// Load environment variables
dotenv.config();

const testEmail = async () => {
    console.log('Testing email configuration...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    console.log('---');

    // Test basic email
    try {
        console.log('📧 Testing basic email...');
        const result = await sendEmail({
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'Test Email - Campus Share',
            html: `
                <div style="font-family: Arial, sans-serif;">
                  <h2>Email Configuration Test</h2>
                  <p>This is a test email to verify the email configuration is working correctly.</p>
                  <p>Environment: ${process.env.NODE_ENV}</p>
                  <p>Timestamp: ${new Date().toISOString()}</p>
                </div>
            `
        });

        if (result.error) {
            console.error('❌ Basic email test failed:', result.error);
            console.error('Error code:', result.code);
        } else if (result.skipped) {
            console.warn('⚠️ Basic email test skipped:', result.messageId);
        } else {
            console.log('✅ Basic email test successful!');
            console.log('Message ID:', result.messageId);
        }
    } catch (error) {
        console.error('❌ Basic email test error:', error.message);
        if (error.code) console.error('Error code:', error.code);
    }

    console.log('---');

    // Test verification email
    try {
        console.log('📧 Testing verification email...');
        const mockUser = {
            name: 'Test User',
            email: process.env.EMAIL_USER
        };
        const verificationCode = '123456';

        const result = await sendEmailVerificationCode(mockUser, verificationCode);

        if (result.error) {
            console.error('❌ Verification email test failed:', result.error);
            console.error('Error code:', result.code);
        } else if (result.skipped) {
            console.warn('⚠️ Verification email test skipped:', result.messageId);
        } else {
            console.log('✅ Verification email test successful!');
            console.log('Message ID:', result.messageId);
        }
    } catch (error) {
        console.error('❌ Verification email test error:', error.message);
        if (error.code) console.error('Error code:', error.code);
    }

    console.log('---');
    console.log('Email configuration test completed.');
    process.exit(0);
};

testEmail();