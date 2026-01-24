import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createSharedCart,
  getSharedCart,
  addItemToCart,
  recordPayment,
} from "../controller/sharedCartController.js";

const router = express.Router();

router.post("/create", auth, createSharedCart);
router.get("/:code", auth, getSharedCart);
router.post("/:code/add", auth, addItemToCart);
router.post("/:code/pay", auth, recordPayment);

export default router;
