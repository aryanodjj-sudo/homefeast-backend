import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";

import { createMeal, updateMeal, deleteMeal } from "../controllers/mealController.js";
import { createCategory, deleteCategory } from "../controllers/categoryController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import {
  getReviews,
  setReviewStatus,
  deleteReview,
} from "../controllers/reviewController.js";
import { getStats, getCustomers } from "../controllers/adminController.js";
import { getMessages, resolveMessage, deleteMessage } from "../controllers/contactController.js";

const router = express.Router();

// Every route below requires a logged-in admin - applied once here.
router.use(protect, adminOnly);

// Meals
router.post("/meals", createMeal);
router.patch("/meals/:id", updateMeal);
router.delete("/meals/:id", deleteMeal);

// Categories
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

// Orders
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Reviews
router.get("/reviews", getReviews);
router.patch("/reviews/:id", setReviewStatus);
router.delete("/reviews/:id", deleteReview);

// Contact Messages
router.get("/messages", getMessages);
router.patch("/messages/:id", resolveMessage);
router.delete("/messages/:id", deleteMessage);

// Dashboard
router.get("/stats", getStats);
router.get("/customers", getCustomers);

export default router;