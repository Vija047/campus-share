import dotenv from 'dotenv';
import { sendEmail } from '../utils/email.js';

// Load environment variables
dotenv.config();

const testEmailConfiguration = async () => {
    console.log('🧪 Testing Email Configuration...\n');

    // Check required environment variables
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease update your .env file with the missing variables.');
        process.exit(1);
    }

    console.log('✅ All required environment variables found');
    console.log(`📧 Email Host: ${process.env.EMAIL_HOST}`);
    console.log(`🔌 Email Port: ${process.env.EMAIL_PORT}`);
    console.log(`👤 Email User: ${process.env.EMAIL_USER}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}\n`);

    // Test email sending
    const testEmail = process.env.EMAIL_USER; // Send test email to self
    const testHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3B82F6;">✅ Email Configuration Test</h2>
            <p>Congratulations! Your email configuration is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
                <li>Host: ${process.env.EMAIL_HOST}</li>
                <li>Port: ${process.env.EMAIL_PORT}</li>
                <li>User: ${process.env.EMAIL_USER}</li>
                <li>Time: ${new Date().toLocaleString()}</li>
            </ul>
            <p>You can now proceed with email verification in your Campus Share application.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
                This is a test email from Campus Share email verification system.
            </p>
        </div>
    `;

    try {
        console.log('📤 Sending test email...');
        const result = await sendEmail({
            to: testEmail,
            subject: '✅ Campus Share - Email Configuration Test',
            html: testHtml
        });

        if (result.skipped) {
            console.warn('⚠️  Email sending was skipped due to missing configuration');
            console.warn('    Make sure all email environment variables are set');
        } else if (result.error) {
            console.error('❌ Email sending failed:');
            console.error(`    ${result.error}`);
        } else {
            console.log('✅ Test email sent successfully!');
            console.log(`    Message ID: ${result.messageId}`);
            console.log(`    Sent to: ${testEmail}`);
            console.log('\n🎉 Email configuration is working correctly!');
            console.log('    Check your inbox for the test email.');
        }
    } catch (error) {
        console.error('❌ Error testing email configuration:');
        console.error(`    ${error.message}`);
    }

    console.log('\n📋 Next Steps:');
    console.log('    1. If test email was successful, email verification is ready');
    console.log('    2. Start your application: npm run dev');
    console.log('    3. Test registration with email verification');
    console.log('    4. Check EMAIL_VERIFICATION_SETUP.md for detailed guide');
};

// Run the test
testEmailConfiguration().catch(console.error);