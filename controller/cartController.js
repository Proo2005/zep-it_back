import Cart from "../models/Cart.js";
import crypto from "crypto";

// Generate unique cart code
const generateCode = () => crypto.randomBytes(3).toString("hex");

export const createCart = async (req, res) => {
  try {
    const { items } = req.body;
    const code = generateCode();
    const user = req.user; // from auth middleware

    const cart = new Cart({
      code,
      items: items.map(item => ({
        ...item,
        addedBy: { userId: user._id, name: user.name, email: user.email },
      })),
      users: [user._id],
    });

    await cart.save();
    res.json({ success: true, code, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating cart" });
  }
};

export const joinCart = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    const cart = await Cart.findOne({ code });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    if (!cart.users.includes(user._id)) {
      cart.users.push(user._id);
      await cart.save();
    }

    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getCart = async (req, res) => {
  try {
    const { code } = req.params;
    const cart = await Cart.findOne({ code }).populate("users", "name email");
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const { cartCode, itemId, quantity } = req.body;
    const cart = await Cart.findOne({ code: cartCode });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(i => i.itemId === itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
