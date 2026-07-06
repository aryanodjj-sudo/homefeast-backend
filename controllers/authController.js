import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Strips the password before a user object ever leaves this file -
// same shape the frontend's mock toSafeUser() already returns.
const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
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
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      user: toSafeUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
// Stateless JWT - nothing to invalidate server-side. Kept as a real route
// anyway so the frontend's authAPI.logout() call has something to hit.
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