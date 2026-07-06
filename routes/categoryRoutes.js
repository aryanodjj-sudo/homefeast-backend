import express from "express";
import { getCategories } from "../controllers/categoryController.js";

const router = express.Router();

// Admin-only create/delete for categories live in adminRoutes.js instead,
// since the frontend calls those under /admin/categories.
router.get("/", getCategories);

export default router;