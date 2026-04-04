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
    subject: "Welcome to the Elite - DevPrep AI",
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #4f46e5; width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 900; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">D</div>
        </div>
        <h1 style="font-size: 28px; font-weight: 800; text-align: center; color: #0f172a; margin-bottom: 16px;">Welcome aboard, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 32px;">
          Your technical journey starts here. You now have full access to our elite AI interview agents, coding lessons, and architectural challenges.
        </p>
        <div style="text-align: center; margin-bottom: 40px;">
          <a href="http://localhost:3000" style="background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Enter the Platform</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">We're excited to see what you build.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="font-size: 12px; color: #cbd5e1; text-align: center;">&copy; 2026 DevPrep AI • Excellence in Engineering</p>
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
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #64748b; width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 900;">D</div>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; text-align: center; color: #0f172a; margin-bottom: 16px;">Password Reset Request</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: center; margin-bottom: 32px;">
          You requested to change your password. Use the button below to set a new one. This link will expire in **10 minutes**.
        </p>
        <div style="text-align: center; margin-bottom: 40px;">
          <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block;">Reset My Password</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="font-size: 12px; color: #cbd5e1; text-align: center;">&copy; 2026 DevPrep AI • Excellence in Engineering</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
