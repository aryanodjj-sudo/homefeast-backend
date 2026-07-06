import express from "express";
import { getMeals, getMealById } from "../controllers/mealController.js";
import { getReviewsForMeal, createReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getMeals);
router.get("/:id", getMealById);

// Reviews nested under a specific meal - matches the frontend's
// request(`/meals/${mealId}/reviews`) calls exactly.
router.get("/:mealId/reviews", getReviewsForMeal);
router.post("/:mealId/reviews", protect, createReview);

export default router;