import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    // Password isn't required for Google accounts - they authenticate via
    // googleId instead, never set/checked against a local password.
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["email", "google"], default: "email" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;