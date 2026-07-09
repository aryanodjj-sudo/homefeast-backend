// Generates a random 6-digit numeric OTP as a string, e.g. "042817".
export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export default generateOtp;