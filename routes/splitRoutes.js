import express from "express";
import { getSplit } from "../controller/splitController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:code", auth, getSplit);

export default router;
