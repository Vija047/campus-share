// Production email configuration verification script
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const verifyEmailConfig = async () => {
    console.log('🔍 Verifying email configuration for production...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('=====================================');

    // Check required environment variables
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        return;
    }

    console.log('✅ All required environment variables are set');
    console.log(`   - EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`   - EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    console.log(`   - EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   - EMAIL_PASS: ${'*'.repeat(process.env.EMAIL_PASS?.length || 0)}`);
    console.log('');

    // Test SMTP connection
    try {
        console.log('🔌 Testing SMTP connection...');

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: parseInt(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production',
                minVersion: 'TLSv1.2',
                servername: process.env.EMAIL_HOST
            },
            connectionTimeout: 30000,
            greetingTimeout: 20000,
            socketTimeout: 30000,
            debug: true,
            logger: true
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');

        // Test sending email
        console.log('📧 Testing email send...');
        const testResult = await transporter.sendMail({
            from: `Student Notes Hub <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Production Email Test - Campus Share',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3B82F6;">🎉 Production Email Test Successful!</h2>
                    <p>This email confirms that your email configuration is working correctly in production mode.</p>
                    <p><strong>Configuration Details:</strong></p>
                    <ul>
                        <li>Host: ${process.env.EMAIL_HOST}</li>
                        <li>Port: ${process.env.EMAIL_PORT}</li>
                        <li>User: ${process.env.EMAIL_USER}</li>
                        <li>Environment: ${process.env.NODE_ENV}</li>
                        <li>Timestamp: ${new Date().toISOString()}</li>
                    </ul>
                    <p style="color: #059669;">Your Campus Share application should now be able to send verification emails successfully!</p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   - Message ID: ${testResult.messageId}`);
        console.log(`   - Response: ${testResult.response}`);

    } catch (error) {
        console.error('❌ SMTP connection/send failed:');
        console.error(`   - Error: ${error.message}`);
        console.error(`   - Code: ${error.code}`);

        // Provide specific troubleshooting advice
        if (error.code === 'EAUTH') {
            console.log('\n🔧 Troubleshooting EAUTH error:');
            console.log('   - Check if EMAIL_USER and EMAIL_PASS are correct');
            console.log('   - For Gmail, ensure you\'re using an App Password, not your regular password');
            console.log('   - Enable 2-Step Verification and generate an App Password');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Troubleshooting ECONNREFUSED error:');
            console.log('   - Check if EMAIL_HOST and EMAIL_PORT are correct');
            console.log('   - Verify network connectivity to the SMTP server');
            console.log('   - Check if the SMTP server is accessible from your deployment environment');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n🔧 Troubleshooting ETIMEDOUT error:');
            console.log('   - Check network connectivity');
            console.log('   - Try increasing timeout values');
            console.log('   - Check if firewall is blocking SMTP connections');
        }

        return;
    }

    console.log('\n🎉 All email configuration checks passed!');
    console.log('Your application should be able to send verification emails in production.');
};

verifyEmailConfig().catch(console.error);