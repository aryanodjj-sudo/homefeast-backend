import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: ["register", "login"], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// TTL index - MongoDB auto-deletes the document once expiresAt has passed,
// so expired OTPs never pile up and never need manual cleanup.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;