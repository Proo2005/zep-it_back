import express from "express";
import {
  createCart,
  joinCart,
  addItemToCart,
} from "../controller/cartController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", auth, createCart);
router.get("/join/:cartCode", auth, joinCart);
router.post("/add/:cartCode", auth, addItemToCart);

export default router;
