# Email Verification Troubleshooting Guide

## Overview
This guide helps resolve email verification issues in production mode for the Campus Share application.

## Common Issues and Solutions

### 1. Email Not Sending in Production

#### Symptoms:
- Registration succeeds but no verification email is received
- Console shows "Email sending failed" errors
- Authentication errors (EAUTH)

#### Solutions:

##### For Gmail Configuration:
1. **Enable 2-Step Verification**
   - Go to Google Account > Security > 2-Step Verification
   - Enable it for your account

2. **Generate App Password**
   - Go to Google Account > Security > App passwords
   - Select "Other" and enter "Campus Share"
   - Use the generated 16-character password as `EMAIL_PASS`

3. **Correct Environment Variables**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

##### For Other Email Providers:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password-or-app-password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### 2. Connection Timeout Issues

#### Symptoms:
- ETIMEDOUT errors
- Connection refused errors

#### Solutions:

1. **Increase Timeout Values**
   ```env
   EMAIL_CONNECTION_TIMEOUT=30000
   EMAIL_SOCKET_TIMEOUT=30000
   ```

2. **Check Firewall Settings**
   - Ensure outbound connections on port 587 (or 465) are allowed
   - Verify hosting platform allows SMTP connections

3. **Try Alternative Ports**
   - Port 587 (TLS/STARTTLS) - recommended
   - Port 465 (SSL) - alternative
   - Port 25 (usually blocked by hosting providers)

### 3. TLS/SSL Certificate Issues

#### Symptoms:
- Certificate validation errors
- SSL handshake failures

#### Solutions:

The application automatically adjusts TLS settings for production:
- `rejectUnauthorized: true` in production
- `rejectUnauthorized: false` in development
- Modern cipher suites for better security

### 4. Testing Email Configuration

Run these commands to test your configuration:

```bash
# Test basic email functionality
npm run test-email

# Comprehensive email configuration verification
npm run test-email-config

# Full deployment verification including email
npm run verify-deployment
```

### 5. Production Environment Variables

Ensure these variables are set in your deployment platform:

**Required:**
- `EMAIL_HOST` - SMTP server hostname
- `EMAIL_PORT` - SMTP port (587 recommended)
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - App password or email password

**Optional (for better reliability):**
- `EMAIL_CONNECTION_TIMEOUT` - Connection timeout in ms (default: 30000)
- `EMAIL_SOCKET_TIMEOUT` - Socket timeout in ms (default: 30000)
- `EMAIL_DEBUG` - Enable debug logging (set to 'true' if needed)

### 6. Deployment Platform Specific Issues

#### Vercel:
- Ensure environment variables are set in Project Settings
- Serverless functions have limited execution time
- Consider using external email service for better reliability

#### Render:
- Set environment variables in the service settings
- Free tier has limited resources, consider upgrading
- Ensure all required variables are marked as "sync: false" in render.yaml

#### Railway/Heroku:
- Set environment variables through the dashboard
- Check for any SMTP restrictions

### 7. Alternative Email Services

If SMTP continues to fail, consider these alternatives:

1. **SendGrid**
   ```javascript
   // Replace SMTP configuration with SendGrid API
   import sgMail from '@sendgrid/mail';
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   ```

2. **AWS SES**
   ```javascript
   // Use AWS SES instead of SMTP
   import AWS from 'aws-sdk';
   const ses = new AWS.SES();
   ```

3. **Mailgun**
   ```javascript
   // Use Mailgun API
   import Mailgun from 'mailgun-js';
   const mailgun = Mailgun({apiKey: API_KEY, domain: DOMAIN});
   ```

### 8. Debugging Steps

1. **Enable Debug Logging**
   ```env
   EMAIL_DEBUG=true
   ```

2. **Check Server Logs**
   - Look for detailed SMTP connection logs
   - Check for authentication failures
   - Monitor timeout issues

3. **Test SMTP Connection Manually**
   ```bash
   telnet smtp.gmail.com 587
   ```

4. **Verify DNS Resolution**
   ```bash
   nslookup smtp.gmail.com
   ```

### 9. Error Codes and Solutions

- **EAUTH**: Authentication failed - check email credentials
- **ECONNREFUSED**: Connection refused - check host and port
- **ETIMEDOUT**: Connection timeout - increase timeout values
- **ENOTFOUND**: Host not found - check EMAIL_HOST spelling
- **EMESSAGE**: Message rejected - check email content/format

### 10. Fallback Strategies

The application implements automatic fallback:
- Multiple retry attempts in production
- Graceful error handling
- User-friendly error messages
- Option to resend verification emails

## Quick Checklist

- [ ] Environment variables are correctly set
- [ ] Using App Password for Gmail (not regular password)
- [ ] Port 587 is accessible from deployment environment
- [ ] TLS/SSL settings are appropriate for production
- [ ] Email service provider allows SMTP access
- [ ] Firewall/security groups allow outbound SMTP connections
- [ ] Test email configuration works locally first
- [ ] Check deployment platform logs for errors

## Need Help?

If issues persist:
1. Run the email verification script: `npm run test-email-config`
2. Check deployment platform documentation for SMTP restrictions
3. Consider switching to API-based email services (SendGrid, SES, etc.)
4. Review server logs for detailed error messages

Remember: Email configuration issues are common in production environments. The key is systematic troubleshooting and ensuring all security requirements are met.