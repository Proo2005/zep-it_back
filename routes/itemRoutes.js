import express from "express";
import { addItem ,updateQuantity } from "../controller/itemController.js";
import auth from "../middleware/authMiddleware.js";
import shopOnly from "../middleware/shopOnly.js";
import Item from "../models/Item.js";

const router = express.Router();

router.get("/all", async (req, res) => {
  const items = await Item.find({ quantity: { $gt: 0 } });
  res.json(items);
});

router.post("/update-quantity", auth, updateQuantity);
router.post("/add", auth, addItem);

router.post("/add", auth, shopOnly, addItem);


export default router;
