import express from "express";
import auth from "../middleware/authMiddleware.js";
import { getWallet, addMoney } from "../controller/walletController.js";

const router = express.Router();

router.get("/", auth, getWallet);
router.post("/add", auth, addMoney);

export default router;
