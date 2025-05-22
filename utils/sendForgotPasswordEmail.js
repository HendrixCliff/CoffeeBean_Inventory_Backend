const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const senderEmail = process.env.SENDER_EMAIL;
const appPassword = process.env.APP_PASSWORD;

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: senderEmail,
    pass: appPassword,
  },
});


const sendForgotPasswordEmail = async (recipientEmail, resetUrl) => {
  const mailOptions = {
    from: `"MyApp Support" <${senderEmail}>`,
    to: recipientEmail,
    subject: '🔐 Reset Your Password',
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password for your account. Click the button below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.response);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error("Email could not be sent");
  }
};

module.exports = { sendForgotPasswordEmail };
