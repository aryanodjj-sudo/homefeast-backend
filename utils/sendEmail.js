import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"HomeFeast" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your HomeFeast verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #f97316;">HomeFeast</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
        <p>This code expires in ${process.env.OTP_EXPIRES_MIN || 10} minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export default sendOtpEmail;