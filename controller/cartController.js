const SharedCart = require("../models/SharedCart");

// Create shared cart
exports.createCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartCode = Math.floor(100000 + Math.random() * 900000).toString();

    const cart = await SharedCart.create({
      cartCode,
      createdBy: userId,
      participants: [userId],
      items: [],
    });

    res.json({ cartCode });
  } catch (err) {
    res.status(500).json({ message: "Error creating cart" });
  }
};

// Get cart by code
exports.getCart = async (req, res) => {
  try {
    const cart = await SharedCart.findOne({ cartCode: req.params.cartCode }).populate("items.addedBy", "name email");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart" });
  }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
  try {
    const { itemId, name, price, quantity } = req.body;
    const userId = req.user.id;

    const cart = await SharedCart.findOne({ cartCode: req.params.cartCode });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const existing = cart.items.find(item => item.itemId === itemId && item.addedBy.toString() === userId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ itemId, name, price, quantity, addedBy: userId });
    }

    if (!cart.participants.includes(userId)) cart.participants.push(userId);

    await cart.save();
    res.json({ message: "Item added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding item" });
  }
};

// Remove item from cart
exports.removeItemFromCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    const cart = await SharedCart.findOne({ cartCode: req.params.cartCode });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items
      .map(item => {
        if (item.itemId === itemId && item.addedBy.toString() === userId) {
          item.quantity -= quantity;
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    await cart.save();
    res.json({ message: "Item updated" });
  } catch (err) {
    res.status(500).json({ message: "Error removing item" });
  }
};
