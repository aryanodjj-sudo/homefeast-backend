import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    mealPreference: { type: String, enum: ["veg", "non-veg", "both"], default: "veg" },
    address: { type: addressSchema, required: true },
    paymentMethod: { type: String, enum: ["cod", "card", "upi"], required: true },
    // Snapshotted at subscribe time from utils/subscriptionPlans.js - never
    // trusts a client-sent price, so a tampered request can't set its own amount.
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Paused", "Cancelled", "Expired"],
      default: "Active",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;