import express from "express";
import { processPayment, getPaymentHistory } from "../controller/paymentHistoryController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------
// Process Payment & Save History
// ------------------------------
router.post("/", auth, processPayment);

// ------------------------------
// Get Logged-in User Payment History
// ------------------------------
router.get("/history", auth, getPaymentHistory);

export default router;
