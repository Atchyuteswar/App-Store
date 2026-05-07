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

exports.sendAnnouncementEmail = async (to, title, body, appName = "Platform") => {
  try {
    const info = await transporter.sendMail({
      from: `"App Store" <${process.env.SMTP_USER || 'no-reply@appstore.local'}>`,
      to,
      subject: `[${appName}] Announcement: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #166534;">New Announcement from ${appName}</h2>
          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${title}</h3>
          <div style="color: #444; line-height: 1.6; margin-top: 20px;">
            ${body.replace(/\n/g, '<br/>')}
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tester/dashboard" style="background-color: #166534; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View in Dashboard
            </a>
          </div>
          <p style="font-size: 12px; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            You received this because you are enrolled in the ${appName} testing program.
          </p>
        </div>
      `,
    });
    return info;
  } catch (error) {
    console.error("Error sending announcement email:", error);
  }
};

exports.sendApprovalEmail = async (to, appName) => {
  try {
    await transporter.sendMail({
      from: `"App Store" <${process.env.SMTP_USER || 'no-reply@appstore.local'}>`,
      to,
      subject: `Approved: You can now test ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #166534;">Enrollment Approved!</h2>
          <p>Great news! Your request to test <strong>${appName}</strong> has been approved by the admin.</p>
          <p>You can now download the app and start providing feedback from your dashboard.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tester/dashboard" style="background-color: #166534; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Start Testing
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};

exports.sendRejectionEmail = async (to, appName, reason) => {
  try {
    await transporter.sendMail({
      from: `"App Store" <${process.env.SMTP_USER || 'no-reply@appstore.local'}>`,
      to,
      subject: `Update regarding your request for ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #991b1b;">Enrollment Update</h2>
          <p>Thank you for your interest in testing <strong>${appName}</strong>.</p>
          <p>Unfortunately, your request could not be approved at this time.</p>
          ${reason ? `<div style="background: #fef2f2; padding: 15px; border-radius: 5px; color: #991b1b; margin-top: 20px;"><strong>Reason:</strong> ${reason}</div>` : ''}
          <p style="margin-top: 20px;">Feel free to apply for other testing programs on the platform.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};
