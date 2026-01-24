import SharedCart from "../models/SharedCart.js";
import { generateCartCode } from "../utils/generateCartCode.js";

/* CREATE SHARED CART */
export const createSharedCart = async (req, res) => {
  try {
    const { items } = req.body;

    const cart = await SharedCart.create({
      cartCode: generateCartCode(),
      createdBy: req.user._id,
      items: items.map(i => ({
        ...i,
        addedBy: req.user._id,
      })),
    });

    res.json({ cartCode: cart.cartCode });
  } catch (err) {
    res.status(500).json({ message: "Failed to create cart" });
  }
};

/* GET CART BY CODE */
export const getSharedCart = async (req, res) => {
  const { code } = req.params;

  const cart = await SharedCart.findOne({ cartCode: code })
    .populate("items.addedBy", "name email")
    .populate("payments.userId", "name");

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  res.json(cart);
};

/* ADD ITEM */
export const addItemToCart = async (req, res) => {
  const { code } = req.params;
  const { item } = req.body;

  const cart = await SharedCart.findOne({ cartCode: code });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const existing = cart.items.find(i => i.itemId === item.itemId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({
      ...item,
      addedBy: req.user._id,
    });
  }

  await cart.save();
  res.json(cart);
};

/* RECORD PAYMENT (SPLIT BILL) */
export const recordPayment = async (req, res) => {
  const { code } = req.params;
  const { amount } = req.body;

  const cart = await SharedCart.findOne({ cartCode: code });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.payments.push({
    userId: req.user._id,
    amount,
    paidAt: new Date(),
  });

  await cart.save();
  res.json({ success: true });
};
