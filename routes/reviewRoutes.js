import express from "express";
import { updateOwnReview, deleteOwnReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Only a logged-in user editing/deleting THEIR OWN review - ownership is
// checked inside the controller itself.
router.use(protect);

router.patch("/:id", updateOwnReview);
router.delete("/:id", deleteOwnReview);

export default router;