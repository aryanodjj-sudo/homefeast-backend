import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the JWT sent as "Authorization: Bearer <token>", attaches the
// matching user (minus password) to req.user, and only then calls next().
// Every protected route in routes/*.js uses this before its controller runs.
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User no longer exists");
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("Not authorized, invalid or expired token"));
    }
  }

  res.status(401);
  next(new Error("Not authorized, no token provided"));
};

// Chained after protect() on admin-only routes (e.g. /admin/meals,
// /admin/orders). req.user is guaranteed to exist by the time this runs.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  next(new Error("Not authorized as an admin"));
};