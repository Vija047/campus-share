import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Check for required environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required email environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Missing required email environment variables: ${missingVars.join(', ')}`);
  }

  // Log configuration for debugging (without sensitive data)
  console.log('Email configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER?.replace(/(.{2}).*@/, '$1***@'),
    environment: process.env.NODE_ENV
  });

  // Determine if we should use secure connection
  const port = parseInt(process.env.EMAIL_PORT);
  const isSecure = port === 465;

  const transportConfig = {
    host: process.env.EMAIL_HOST,
    port: port,
    secure: isSecure, // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add improved timeout settings
    connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT) || (process.env.NODE_ENV === 'production' ? 30000 : 20000),
    greetingTimeout: process.env.NODE_ENV === 'production' ? 20000 : 15000,
    socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT) || (process.env.NODE_ENV === 'production' ? 30000 : 20000),
    // Add additional options for better reliability
    pool: true,
    maxConnections: process.env.NODE_ENV === 'production' ? 5 : 3,
    maxMessages: 100,
    rateLimit: process.env.NODE_ENV === 'production' ? 10 : 5, // Max emails per second
    // Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      minVersion: 'TLSv1.2',
      // Add additional TLS options for production
      ...(process.env.NODE_ENV === 'production' && {
        servername: process.env.EMAIL_HOST,
        ciphers: 'ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS'
      })
    },
    // Add debug option for production troubleshooting
    debug: process.env.NODE_ENV === 'development' || process.env.EMAIL_DEBUG === 'true',
    logger: process.env.NODE_ENV === 'development' || process.env.EMAIL_DEBUG === 'true'
  };

  return nodemailer.createTransport(transportConfig);
};

export const sendEmail = async (options) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const errorMsg = 'Email configuration not available. Missing required environment variables.';
      console.error(errorMsg);

      // In production, this should be treated as an error, not a skip
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMsg);
      }

      return { messageId: 'email-config-missing', skipped: true };
    }

    const transporter = createTransporter();

    // Verify connection before sending (with retry logic for production)
    let verifyAttempts = process.env.NODE_ENV === 'production' ? 3 : 1;
    let verifyError;

    for (let i = 0; i < verifyAttempts; i++) {
      try {
        await transporter.verify();
        verifyError = null;
        break;
      } catch (error) {
        verifyError = error;
        if (i < verifyAttempts - 1) {
          console.log(`SMTP verification attempt ${i + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
    }

    if (verifyError) {
      console.error('SMTP connection verification failed after all attempts:', verifyError.message);
      if (process.env.NODE_ENV === 'production') {
        throw verifyError; // In production, throw the error instead of returning
      }
      return { messageId: 'smtp-verify-failed', error: verifyError.message };
    }

    const mailOptions = {
      from: `Student Notes Hub <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      // Add additional options for better deliverability
      replyTo: process.env.EMAIL_USER,
      ...(process.env.NODE_ENV === 'production' && {
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'Student Notes Hub',
        }
      })
    };

    // Add retry logic for production
    let sendAttempts = process.env.NODE_ENV === 'production' ? 3 : 1;
    let sendError;

    for (let i = 0; i < sendAttempts; i++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
          messageId: info.messageId,
          to: options.to,
          subject: options.subject,
          attempt: i + 1
        });
        return info;
      } catch (error) {
        sendError = error;
        if (i < sendAttempts - 1) {
          console.log(`Email send attempt ${i + 1} failed, retrying...`, error.message);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
        }
      }
    }

    // If all attempts failed, throw the error
    throw sendError;
  } catch (error) {
    console.error('Email sending failed:', error);

    // Log specific error types for debugging
    if (error.code === 'ETIMEDOUT') {
      console.error('Email timeout - check network connectivity or SMTP settings');
    } else if (error.code === 'EAUTH') {
      console.error('Email authentication failed - check credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Email connection refused - check SMTP server and port');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Email host not found - check EMAIL_HOST configuration');
    }

    // In production, throw the error to ensure proper error handling
    // In development, return a failure indicator to prevent crashes during testing
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    return { messageId: 'email-failed', error: error.message, code: error.code };
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Welcome to Student Notes Hub!</h2>
      <p>Hi ${user.name},</p>
      <p>Welcome to Student Notes Hub! We're excited to have you join our community of students sharing knowledge.</p>
      <p>Here's what you can do:</p>
      <ul>
        <li>Upload and share your notes</li>
        <li>Download notes from other students</li>
        <li>Participate in semester discussions</li>
        <li>Chat with your classmates</li>
      </ul>
      <p>Happy learning!</p>
      <p>Best regards,<br>Student Notes Hub Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Student Notes Hub!',
    html,
  });
};

export const sendNotificationEmail = async (user, notification) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">${notification.title}</h2>
      <p>Hi ${user.name},</p>
      <p>${notification.message}</p>
      <p>Visit Student Notes Hub to see more details.</p>
      <p>Best regards,<br>Student Notes Hub Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: notification.title,
    html,
  });
};

export const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Student Notes Hub</h1>
          <div style="width: 50px; height: 3px; background-color: #3B82F6; margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #2D3748; text-align: center; margin-bottom: 20px;">Verify Your Email Address</h2>
        
        <p style="color: #4A5568; line-height: 1.6;">Hi ${user.name},</p>
        
        <p style="color: #4A5568; line-height: 1.6;">
          Thank you for registering with Student Notes Hub! To complete your account setup and start sharing knowledge with fellow students, please verify your email address.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #718096; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #3B82F6; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <div style="background-color: #FFF5F5; border-left: 4px solid #F56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #C53030; margin: 0; font-weight: bold;">⚠️ Important Security Notice</p>
          <p style="color: #9B2C2C; margin: 10px 0 0 0; font-size: 14px;">
            This verification link will expire in 24 hours for your security. If you didn't create this account, please ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            Best regards,<br>
            <strong>Student Notes Hub Team</strong>
          </p>
          <p style="color: #A0AEC0; font-size: 12px; margin-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '📧 Verify Your Email - Student Notes Hub',
    html,
  });
};

export const sendOTPEmail = async (user, otp, ipAddress = 'Unknown') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Student Notes Hub</h1>
          <div style="width: 50px; height: 3px; background-color: #3B82F6; margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #2D3748; text-align: center; margin-bottom: 20px;">🔐 Password Reset Request</h2>
        
        <p style="color: #4A5568; line-height: 1.6;">Hi ${user.name},</p>
        
        <p style="color: #4A5568; line-height: 1.6;">
          We received a request to reset your password for your Student Notes Hub account. Use the following One-Time Password (OTP) to proceed:
        </p>
        
        <div style="background-color: #EDF2F7; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px dashed #3B82F6;">
          <h1 style="color: #3B82F6; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          <p style="color: #718096; margin: 10px 0 0 0; font-size: 14px;">Enter this code to reset your password</p>
        </div>
        
        <div style="background-color: #FED7D7; border-left: 4px solid #F56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #C53030; margin: 0; font-weight: bold;">⏰ Security Notice</p>
          <ul style="color: #9B2C2C; margin: 10px 0 0 0; font-size: 14px; padding-left: 20px;">
            <li>This OTP will expire in exactly 10 minutes</li>
            <li>It can only be used once</li>
            <li>Request came from IP: ${ipAddress}</li>
          </ul>
        </div>
        
        <div style="background-color: #E6FFFA; border-left: 4px solid #38B2AC; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #2D7D73; margin: 0; font-weight: bold;">🛡️ Didn't request this?</p>
          <p style="color: #2D7D73; margin: 10px 0 0 0; font-size: 14px;">
            If you didn't request this password reset, your account may be compromised. Please secure your account immediately or contact our support team.
          </p>
        </div>
        
        <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            Best regards,<br>
            <strong>Student Notes Hub Security Team</strong>
          </p>
          <p style="color: #A0AEC0; font-size: 12px; margin-top: 15px;">
            This is an automated security message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '🔐 Password Reset OTP - Student Notes Hub [Security Alert]',
    html,
  });
};

export const sendPasswordResetSuccessEmail = async (user, ipAddress = 'Unknown') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Student Notes Hub</h1>
          <div style="width: 50px; height: 3px; background-color: #3B82F6; margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #38A169; text-align: center; margin-bottom: 20px;">✅ Password Reset Successful</h2>
        
        <p style="color: #4A5568; line-height: 1.6;">Hi ${user.name},</p>
        
        <p style="color: #4A5568; line-height: 1.6;">
          Your password has been successfully reset for your Student Notes Hub account.
        </p>
        
        <div style="background-color: #F0FFF4; border-left: 4px solid #38A169; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #2F855A; margin: 0; font-weight: bold;">🔒 Reset Details</p>
          <ul style="color: #2F855A; margin: 10px 0 0 0; font-size: 14px; padding-left: 20px;">
            <li>Date: ${new Date().toLocaleString()}</li>
            <li>IP Address: ${ipAddress}</li>
          </ul>
        </div>
        
        <div style="background-color: #FED7D7; border-left: 4px solid #F56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #C53030; margin: 0; font-weight: bold;">🚨 Didn't reset your password?</p>
          <p style="color: #9B2C2C; margin: 10px 0 0 0; font-size: 14px;">
            If you didn't reset your password, please contact our support team immediately as your account may be compromised.
          </p>
        </div>
        
        <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            Best regards,<br>
            <strong>Student Notes Hub Security Team</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '✅ Password Reset Successful - Student Notes Hub',
    html,
  });
};

export const sendAccountLockedEmail = async (user, lockDuration = '2 hours') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Student Notes Hub</h1>
          <div style="width: 50px; height: 3px; background-color: #3B82F6; margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #E53E3E; text-align: center; margin-bottom: 20px;">🔒 Account Temporarily Locked</h2>
        
        <p style="color: #4A5568; line-height: 1.6;">Hi ${user.name},</p>
        
        <p style="color: #4A5568; line-height: 1.6;">
          Your Student Notes Hub account has been temporarily locked due to multiple failed login attempts.
        </p>
        
        <div style="background-color: #FED7D7; border-left: 4px solid #F56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #C53030; margin: 0; font-weight: bold;">🔐 Lock Details</p>
          <ul style="color: #9B2C2C; margin: 10px 0 0 0; font-size: 14px; padding-left: 20px;">
            <li>Account locked for: ${lockDuration}</li>
            <li>Reason: Too many failed login attempts</li>
            <li>Time: ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        
        <p style="color: #4A5568; line-height: 1.6;">
          If this wasn't you, please contact our support team immediately as your account may be under attack.
        </p>
        
        <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            Best regards,<br>
            <strong>Student Notes Hub Security Team</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '🔒 Account Locked - Student Notes Hub [Security Alert]',
    html,
  });
};

export const sendEmailVerificationCode = async (user, verificationCode) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Student Notes Hub</h1>
          <div style="width: 50px; height: 3px; background-color: #3B82F6; margin: 10px auto;"></div>
        </div>
        
        <h2 style="color: #2D3748; text-align: center; margin-bottom: 20px;">📧 Verify Your Email Address</h2>
        
        <p style="color: #4A5568; line-height: 1.6;">Hi ${user.name},</p>
        
        <p style="color: #4A5568; line-height: 1.6;">
          Welcome to Student Notes Hub! To complete your registration and secure your account, please verify your email address using the verification code below:
        </p>
        
        <div style="background-color: #EDF2F7; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px dashed #3B82F6;">
          <h1 style="color: #3B82F6; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${verificationCode}</h1>
          <p style="color: #718096; margin: 10px 0 0 0; font-size: 14px;">Enter this code to verify your email</p>
        </div>
        
        <div style="background-color: #FED7D7; border-left: 4px solid #F56565; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #C53030; margin: 0; font-weight: bold;">⏰ Important Notice</p>
          <ul style="color: #9B2C2C; margin: 10px 0 0 0; font-size: 14px; padding-left: 20px;">
            <li>This verification code will expire in exactly 15 minutes</li>
            <li>It can only be used once</li>
            <li>Do not share this code with anyone</li>
          </ul>
        </div>
        
        <div style="background-color: #E6FFFA; border-left: 4px solid #38B2AC; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #2D7D73; margin: 0; font-weight: bold;">🎉 What's next?</p>
          <p style="color: #2D7D73; margin: 10px 0 0 0; font-size: 14px;">
            Once verified, you'll have full access to upload notes, join discussions, bookmark content, and connect with fellow students!
          </p>
        </div>
        
        <div style="background-color: #FFF5CD; border-left: 4px solid #F6E05E; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #B7791F; margin: 0; font-weight: bold;">🛡️ Didn't register?</p>
          <p style="color: #B7791F; margin: 10px 0 0 0; font-size: 14px;">
            If you didn't create an account with us, please ignore this email. Your email address will not be added to our system.
          </p>
        </div>
        
        <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            Best regards,<br>
            <strong>Student Notes Hub Team</strong>
          </p>
          <p style="color: #A0AEC0; font-size: 12px; margin-top: 15px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: '📧 Verify Your Email - Student Notes Hub',
    html,
  });
};
