const nodemailer = require("nodemailer");
require("dotenv").config({ path: __dirname + "/../.env" });

console.log("Email user:", process.env.EMAIL_USER);
console.log("Email pass length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  try {
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("Transporter verified successfully!");

    console.log("Attempting to send test email...");
    const info = await transporter.sendMail({
      from: `"DevPrep AI Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "SMTP Connection Test",
      text: "If you receive this, Nodemailer is working perfectly!",
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    process.exit(0);
  } catch (error) {
    console.error("SMTP Error encountered:");
    console.error(error);
    process.exit(1);
  }
}

main();
