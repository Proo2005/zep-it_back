import express from "express";
import { getMonthlyAnalysis } from "../controller/analysisController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Shop/Admin analytics
router.get("/monthly", auth, getMonthlyAnalysis);

export default router;
