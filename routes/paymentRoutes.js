import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createOrder,
  verifyPayment,
  getPayments,
  getAllPayments,
} from "../controller/paymentController.js";

const router = express.Router();

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);
router.get("/history", auth, getPayments);
router.get("/all", auth, getAllPayments);


export default router;
