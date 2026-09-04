import express from "express";
import {
  getOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";
import { applySubscriptionDiscount } from "../middleware/subscriptionDiscount.js";

const router = express.Router();

// Every order route needs a logged-in user - applied once here instead of
// repeating protect on each line below.
router.use(protect);

router.get("/", getOrders);

// applySubscriptionDiscount runs after protect (so req.user exists) and
// before placeOrder - it overrides the incoming pricing.total to 0 when
// the placing customer has an active subscription, so placeOrder itself
// never needs to know anything about subscriptions.
router.post("/", applySubscriptionDiscount, placeOrder);

router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

export default router;