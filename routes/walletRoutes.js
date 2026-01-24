import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createWalletOrder,
  verifyWalletPayment,
  getWallet,
} from "../controller/walletController.js";

const router = express.Router();

router.post("/create-order", auth, createWalletOrder);
router.post("/verify", auth, verifyWalletPayment);
router.get("/", auth, getWallet);

export default router;
