import express from "express";
import { createMessage } from "../controllers/contactController.js";

const router = express.Router();

// Public route - no login required, anyone can send a query
router.post("/", createMessage);

export default router;