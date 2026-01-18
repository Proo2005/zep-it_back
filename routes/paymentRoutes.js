import express from "express";
import { processPayment } from "../controller/paymentHistoryController.js";
import { getPaymentsByUser } from "../controller/paymentController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/process", processPayment);

router.get("/", auth, getPaymentsByUser);
export default router;
