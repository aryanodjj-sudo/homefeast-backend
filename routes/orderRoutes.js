import express from "express";
import {
  getOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Every order route needs a logged-in user - applied once here instead of
// repeating protect on each line below.
router.use(protect);

router.get("/", getOrders);
router.post("/", placeOrder);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

export default router;