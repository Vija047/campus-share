import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Check for required environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required email environment variables: ${missingVars.join(', ')}`);
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add improved timeout settings from environment or defaults
    connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT) || 30000, // 30 seconds
    greetingTimeout: 20000, // 20 seconds
    socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT) || 30000, // 30 seconds
    // Add additional options for better reliability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10, // Max 10 emails per second
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000
    }
  });
};

export const sendEmail = async (options) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration not available. Skipping email send.');
      return { messageId: 'email-config-missing', skipped: true };
    }

    const transporter = createTransporter();

    // Verify connection before sending
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP connection verification failed:', verifyError.message);
      return { messageId: 'smtp-verify-failed', error: verifyError.message };
    }

    const mailOptions = {
      from: `Student Notes Hub <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);

    // Log specific error types for debugging
    if (error.code === 'ETIMEDOUT') {
      console.error('Email timeout - check network connectivity or SMTP settings');
    } else if (error.code === 'EAUTH') {
      console.error('Email authentication failed - check credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Email connection refused - check SMTP server and port');
    }

    // Don't throw the error to prevent application crashes
    // Instead, log it and return a failure indicator
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

  await sendEmail({
    to: user.email,
    subject: '📧 Verify Your Email - Student Notes Hub',
    html,
  });
};
