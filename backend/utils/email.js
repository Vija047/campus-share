import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

export const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `Student Notes Hub <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
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

export const sendOTPEmail = async (user, otp) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3B82F6; text-align: center;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You have requested to reset your password for Student Notes Hub. Please use the following OTP to proceed:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #3B82F6; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
      </div>
      <p style="color: #dc3545; font-weight: bold;">This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Best regards,<br>Student Notes Hub Team</p>
    </div>
  `;

    await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP - Student Notes Hub',
        html,
    });
};
