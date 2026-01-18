import express from "express";
import { getShopAnalysis } from "../controller/shopAnalysisController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getShopAnalysis);

export default router;
