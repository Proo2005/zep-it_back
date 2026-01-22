import Cart from "../models/Cart.js";
import crypto from "crypto";

// Create new shared cart
export const createCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartCode = crypto.randomBytes(4).toString("hex");

    const cart = await Cart.create({
      cartCode,
      createdBy: userId,
      participants: [userId],
      items: [],
    });

    res.json({
      cartId: cart._id,
      shareLink: `${process.env.FRONTEND_URL}/cart/${cartCode}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join cart via link
export const joinCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartCode } = req.params;

    const cart = await Cart.findOne({ cartCode });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (!cart.participants.includes(userId)) {
      cart.participants.push(userId);
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add item to shared cart
export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartCode } = req.params;
    const { itemId, itemName, price, quantity } = req.body;

    const cart = await Cart.findOne({ cartCode });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items.push({
      itemId,
      itemName,
      price,
      quantity,
      addedBy: userId,
    });

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
