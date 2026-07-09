import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  sendOtp,
  verifyOtp,
  googleAuth,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google", googleAuth);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.patch("/profile", protect, updateProfile);

export default router;