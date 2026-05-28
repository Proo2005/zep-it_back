import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createOrder,
  verifyPaymentWebhook,
  getPayments,
  getAllPayments,
} from "../controller/paymentController.js";

const router = express.Router();

router.post("/create-order", auth, createOrder);
router.post("/webhook", verifyPaymentWebhook); // Replaces "/verify" and removes 'auth'
router.get("/history", auth, getPayments);
router.get("/all", auth, getAllPayments);

export default router;