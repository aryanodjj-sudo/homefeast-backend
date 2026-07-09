import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateToken from "../utils/generateToken.js";
import generateOtp from "../utils/otp.js";
import sendOtpEmail from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MIN) || 10;

// Strips the password before a user object ever leaves this file -
// same shape the frontend's mock toSafeUser() already returns.
const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
});

// POST /api/auth/send-otp
// body: { email, purpose: "register" | "login" }
// Admins log in with just email + password - no inbox to send an OTP to is
// assumed, so this responds with otpRequired: false for an admin's email on
// the login purpose, and the frontend skips straight to "verified".
export const sendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    if (!email?.trim() || !["register", "login"].includes(purpose)) {
      res.status(400);
      throw new Error("A valid email and purpose are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (purpose === "register" && existingUser) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }
    if (purpose === "login" && !existingUser) {
      res.status(404);
      throw new Error("No account found with this email");
    }

    // Admin accounts skip the OTP step entirely on login.
    if (purpose === "login" && existingUser.role === "admin") {
      return res.json({ success: true, otpRequired: false });
    }

    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // One active OTP per email+purpose at a time - replace any previous one.
    await Otp.findOneAndDelete({ email: normalizedEmail, purpose });
    await Otp.create({
      email: normalizedEmail,
      purpose,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000),
    });

    await sendOtpEmail(normalizedEmail, otp);

    res.json({ success: true, otpRequired: true, message: `OTP sent to ${normalizedEmail}` });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
// body: { email, otp, purpose }
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email?.trim() || !otp?.trim() || !["register", "login"].includes(purpose)) {
      res.status(400);
      throw new Error("Email, OTP and purpose are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpDoc = await Otp.findOne({ email: normalizedEmail, purpose });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      res.status(400);
      throw new Error("OTP expired. Please request a new one");
    }

    if (otpDoc.attempts >= 5) {
      res.status(429);
      throw new Error("Too many incorrect attempts. Please request a new OTP");
    }

    const isMatch = await bcrypt.compare(otp.trim(), otpDoc.otpHash);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      res.status(400);
      throw new Error("Incorrect OTP");
    }

    await Otp.deleteOne({ _id: otpDoc._id });

    const verifyToken = jwt.sign(
      { email: normalizedEmail, purpose, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ verifyToken });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, verifyToken } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
    }

    if (!verifyToken) {
      res.status(400);
      throw new Error("Please verify your email with the OTP first");
    }

    let decoded;
    try {
      decoded = jwt.verify(verifyToken, process.env.JWT_SECRET);
    } catch {
      res.status(400);
      throw new Error("Email verification expired. Please verify again");
    }

    if (
      !decoded.verified ||
      decoded.purpose !== "register" ||
      decoded.email !== email.trim().toLowerCase()
    ) {
      res.status(400);
      throw new Error("Email verification does not match. Please verify again");
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      password,
      role: "customer",
      authProvider: "email",
    });

    res.status(201).json({
      user: toSafeUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
// Password is checked first, then OTP is only required for customer
// accounts - admins (role === "admin") log in with just email + password.
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, verifyToken } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (user.role !== "admin") {
      if (!verifyToken) {
        res.status(400);
        throw new Error("Please verify your email with the OTP first");
      }

      let decoded;
      try {
        decoded = jwt.verify(verifyToken, process.env.JWT_SECRET);
      } catch {
        res.status(400);
        throw new Error("Email verification expired. Please verify again");
      }

      if (
        !decoded.verified ||
        decoded.purpose !== "login" ||
        decoded.email !== normalizedEmail
      ) {
        res.status(400);
        throw new Error("Email verification does not match. Please verify again");
      }
    }

    res.json({
      user: toSafeUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/google
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error("Google credential is required");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || email.split("@")[0];

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        role: "customer",
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      user: toSafeUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(401);
    next(new Error("Google sign-in failed. Please try again."));
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res) => {
  res.json({ success: true });
};

// PATCH /api/auth/profile (protected)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.name = name?.trim() || user.name;
    user.phone = phone?.trim() ?? user.phone;

    const updatedUser = await user.save();
    res.json({ user: toSafeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
};