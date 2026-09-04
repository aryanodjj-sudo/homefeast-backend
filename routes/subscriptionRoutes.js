import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createSubscription,
  getMySubscriptions,
  cancelMySubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Every route here requires a logged-in customer.
router.use(protect);

router.post("/", createSubscription);
router.get("/my", getMySubscriptions);
router.patch("/:id/cancel", cancelMySubscription);

export default router;