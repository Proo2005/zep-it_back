import Cart from "../models/Cart.js";

export const getSplit = async (req, res) => {
  try {
    const { code } = req.params;
    const cart = await Cart.findOne({ code }).populate("users", "name email");
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const splitMap = {};
    cart.items.forEach(item => {
      const userId = item.addedBy.userId.toString();
      if (!splitMap[userId]) splitMap[userId] = 0;
      splitMap[userId] += item.price * item.quantity;
    });

    const result = cart.users.map(user => ({
      name: user.name,
      email: user.email,
      owes: splitMap[user._id.toString()] || 0,
    }));

    res.json({ success: true, split: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
