import express from "express";
import { createCart, joinCart, getCart, updateItemQuantity } from "../controller/cartController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", auth, createCart);
router.post("/join", auth, joinCart);
router.get("/:code", auth, getCart);
router.post("/update-quantity", auth, updateItemQuantity);

export default router;
