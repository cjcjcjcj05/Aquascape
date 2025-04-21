import nodemailer from 'nodemailer';

// Create a test account using Ethereal Email (fake SMTP service)
// This is perfect for development - emails won't be delivered but can be viewed
let transporter: nodemailer.Transporter | null = null;

// Initialize the email transporter
export async function initializeEmailService() {
  try {
    // Create a testing account with Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    // Configure the transporter with Ethereal credentials
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Email service initialized with Ethereal Email');
    console.log(`Preview URL: https://ethereal.email/login (username: ${testAccount.user}, password: ${testAccount.pass})`);
    return true;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return false;
  }
}

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<string | null> {
  if (!transporter) {
    await initializeEmailService();
    if (!transporter) {
      console.error('Email service not initialized');
      return null;
    }
  }
  
  try {
    // Send email
    const info = await transporter.sendMail({
      from: '"AquaScape Design" <aquascape@example.com>',
      to,
      subject,
      text,
      html,
    });
    
    console.log('Email sent:', info.messageId);
    
    // Get the preview URL for Ethereal Email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);
    
    return previewUrl as string;
  } catch (error) {
    console.error('Failed to send email:', error);
    return null;
  }
}

export async function sendPasswordResetEmail(to: string, token: string, username: string): Promise<string | null> {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
  
  return sendEmail({
    to,
    subject: 'Reset Your AquaScape Password',
    text: `Hi ${username},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nRegards,\nAquaScape Design Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2C7BBF;">AquaScape Password Reset</h2>
        <p>Hi ${username},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2C7BBF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Regards,<br>AquaScape Design Team</p>
      </div>
    `
  });
}

export async function sendVerificationEmail(to: string, token: string, username: string): Promise<string | null> {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
  
  return sendEmail({
    to,
    subject: 'Verify Your AquaScape Email',
    text: `Hi ${username},\n\nThank you for registering with AquaScape. Please verify your email by clicking the link below:\n\n${verifyUrl}\n\nRegards,\nAquaScape Design Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2C7BBF;">AquaScape Email Verification</h2>
        <p>Hi ${username},</p>
        <p>Thank you for registering with AquaScape. Please verify your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2C7BBF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
        </div>
        <p>Regards,<br>AquaScape Design Team</p>
      </div>
    `
  });
}