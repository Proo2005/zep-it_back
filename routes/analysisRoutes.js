import express from "express";
import { getShopAnalysis } from "../controller/analysisController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Shop/Admin analytics
router.get("/shop", auth, getShopAnalysis);

export default router;
