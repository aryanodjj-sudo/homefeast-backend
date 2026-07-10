// Render blocks outbound SMTP connections (ports 25/465/587) on all plans,
// so nodemailer -> Gmail direct SMTP never connects there (ETIMEDOUT).
// Brevo's HTTPS API works instead, since regular HTTPS traffic isn't blocked.
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendOtpEmail = async (to, otp) => {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "HomeFeast", email: process.env.EMAIL_FROM_ADDRESS },
      to: [{ email: to }],
      subject: "Your HomeFeast verification code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #f97316;">HomeFeast</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
          <p>This code expires in ${process.env.OTP_EXPIRES_MIN || 10} minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to send OTP email");
  }
};

export default sendOtpEmail;