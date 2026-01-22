import express from "express";
import {
  createCart,
  getCart,
  addItemToCart,
  removeItemFromCart,
} from "../controller/cartController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", auth, createCart);
router.get("/:cartCode", auth, getCart);
router.post("/add/:cartCode", auth, addItemToCart);
router.post("/remove/:cartCode", auth, removeItemFromCart);

export default router;
