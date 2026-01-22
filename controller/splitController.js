const Cart = require("../models/Cart");

exports.getSplitDetails = async (req, res) => {
  try {
    const { cartCode } = req.params;

    const cart = await Cart.findOne({ cartCode });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const splitMap = {};

    cart.items.forEach(item => {
      const userId = item.addedBy.userId.toString();

      if (!splitMap[userId]) {
        splitMap[userId] = {
          userId,
          name: item.addedBy.name,
          email: item.addedBy.email,
          items: [],
          subtotal: 0,
        };
      }

      const itemTotal = item.price * item.quantity;

      splitMap[userId].items.push({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      });

      splitMap[userId].subtotal += itemTotal;
    });

    const splitDetails = Object.values(splitMap);

    res.json({
      cartCode,
      splitDetails,
      grandTotal: splitDetails.reduce(
        (sum, u) => sum + u.subtotal,
        0
      ),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
