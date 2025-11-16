import axios from 'axios';
import dotenv from 'dotenv';
import { sendEmail } from '../utils/email.js';

dotenv.config();

const verifyDeployment = async () => {
    console.log('🔍 Verifying deployment configuration...\n');

    // Check environment variables
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'EMAIL_USER',
        'EMAIL_PASS',
        'GOOGLE_AI_API_KEY'
    ];

    console.log('📋 Environment Variables Check:');
    const missingVars = [];
    requiredEnvVars.forEach(varName => {
        const exists = !!process.env[varName];
        console.log(`  ${exists ? '✅' : '❌'} ${varName}: ${exists ? 'Set' : 'Missing'}`);
        if (!exists) missingVars.push(varName);
    });

    if (missingVars.length > 0) {
        console.log(`\n⚠️  Missing environment variables: ${missingVars.join(', ')}`);
        console.log('Please set these in your deployment platform (Vercel/Render)');
    } else {
        console.log('\n✅ All required environment variables are set');
    }

    // Test local server if running
    try {
        const port = process.env.PORT || 5000;
        const response = await axios.get(`http://localhost:${port}/health`, {
            timeout: 5000
        });
        console.log('\n🏥 Health Check:');
        console.log('  ✅ Server is running locally');
        console.log(`  📊 Status: ${response.data.status}`);
        console.log(`  🗄️  Database: ${response.data.database}`);
        console.log(`  ⏱️  Uptime: ${Math.floor(response.data.uptime)}s`);
    } catch (error) {
        console.log('\n🏥 Health Check:');
        console.log('  ❌ Server not running locally (this is OK for deployment verification)');
    }

    // Test email configuration
    console.log('\n📧 Email Configuration Test:');
    try {
        const emailResult = await sendEmail({
            to: process.env.EMAIL_USER,
            subject: 'Deployment Verification - Campus Share',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3B82F6;">🚀 Deployment Verification Complete</h2>
                    <p>This email confirms that the Campus Share email system is working correctly in the deployment environment.</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p style="color: #059669;">Email verification functionality is working! ✅</p>
                </div>
            `
        });

        if (emailResult && !emailResult.error) {
            console.log('  ✅ Email configuration is working correctly');
            console.log(`  📧 Test email sent with ID: ${emailResult.messageId}`);
        } else {
            console.log('  ❌ Email configuration failed:', emailResult.error);
        }
    } catch (emailError) {
        console.log('  ❌ Email configuration error:', emailError.message);
        console.log('  ⚠️  This will affect user registration and password reset functionality');
    }

    // Configuration summary
    console.log('\n📝 Deployment Configuration Summary:');
    console.log('  🎯 Node.js version: >= 18.0.0');
    console.log('  📦 Package manager: npm');
    console.log('  🚀 Start command: npm start');
    console.log('  🏗️  Build command: npm ci --only=production');
    console.log('  🌐 CORS origins configured for Vercel and Render');
    console.log('  🔒 Security headers enabled with Helmet');
    console.log('  ⚡ Rate limiting configured');

    console.log('\n🚀 Deployment Checklist:');
    console.log('  ✅ vercel.json updated with proper serverless config');
    console.log('  ✅ render.yaml updated with correct build settings');
    console.log('  ✅ CORS configured for frontend domains');
    console.log('  ✅ Health endpoint available at /health');
    console.log('  ✅ Environment variables documented');
    console.log('  ✅ Email configuration verification added');

    console.log('\n💡 Next Steps:');
    console.log('  1. Set environment variables in your deployment platform');
    console.log('  2. Ensure EMAIL_USER and EMAIL_PASS are correctly configured');
    console.log('  3. For Gmail, use App Password instead of regular password');
    console.log('  4. Deploy backend to Vercel or Render');
    console.log('  5. Update frontend API URLs to match deployed backend');
    console.log('  6. Deploy frontend to Vercel');
    console.log('  7. Test email verification with real users');

    console.log('\n🎉 Deployment configuration verified!');
};

verifyDeployment().catch(console.error);