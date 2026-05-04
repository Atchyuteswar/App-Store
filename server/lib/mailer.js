const nodemailer = require('nodemailer');

// Configure transport
// In production, configure these in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

exports.sendConfirmationEmail = async (to, fullName, appName) => {
  try {
    const info = await transporter.sendMail({
      from: `"App Store Testing" <${process.env.SMTP_USER || 'no-reply@appstore.local'}>`,
      to,
      subject: `A/B Testing Enrollment Confirmation: ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Welcome to the A/B Testing Program!</h2>
          <p>Hi ${fullName},</p>
          <p>You have successfully enrolled in the A/B testing program for <strong>${appName}</strong>.</p>
          <p>We appreciate your help in testing the app. Please keep in mind the terms and conditions you agreed to regarding copying or exploiting the application.</p>
          <p>You can manage your testing enrollments and access testing resources via your Tester Dashboard.</p>
          <div style="margin-top: 30px; margin-bottom: 30px; text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tester/dashboard" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Go to Tester Dashboard
            </a>
          </div>
          <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // We don't throw here to avoid failing the enrollment if email fails
  }
};
