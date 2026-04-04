const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"DevPrep AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - DevPrep AI",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #4f46e5; width: 60px; height: 60px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">D</div>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px;">Verify Your Email</h1>
        <p style="text-align: center; color: #64748b; font-size: 16px; margin-bottom: 30px;">Use the following code to complete your registration on DevPrep AI.</p>
        
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">This code will expire in 10 minutes. If you didn't request this email, please ignore it.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="font-size: 12px; color: #cbd5e1; text-align: center;">&copy; 2026 DevPrep AI. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"DevPrep AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to DevPrep AI!",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b;">
        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">Welcome to the Elite, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          Your account is now verified. You're ready to master technical interviews with real-time AI guidance.
        </p>
        <div style="text-align: center;">
          <a href="http://localhost:3000" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Start Practicing</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendResetEmail = async (email, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  const mailOptions = {
    from: `"DevPrep AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - DevPrep AI",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b;">
        <h2 style="font-weight: 800; text-align: center;">Password Reset Request</h2>
        <p style="color: #475569; line-height: 1.6; text-align: center;">You requested a password reset. Click the button below to set a new password. This link expires in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${resetUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
