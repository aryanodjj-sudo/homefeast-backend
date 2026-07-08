import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "General Query", trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["New", "Resolved"], default: "New" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
export default ContactMessage;