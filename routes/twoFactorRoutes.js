import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  send2FAOtp,
  verify2FAOtp,
} from "../controller/twoFactorController.js";

const router = express.Router();

router.post("/send-otp", auth, send2FAOtp);
router.post("/verify-otp", auth, verify2FAOtp);

export default router;
