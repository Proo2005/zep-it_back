import Item from "../models/Item.js";
import User from "../models/User.js";

// Add new item or increase quantity if it exists
export const addItem = async (req, res) => {
  try {
    const {
      shopName,
      shopGstId,
      shopkeeperEmail,
      category,
      itemName,
      quantity,
      amount,
    } = req.body;

    // Validate required fields
    if (
      !shopName ||
      !shopGstId ||
      !shopkeeperEmail ||
      !category ||
      !itemName ||
      quantity === undefined ||
      amount === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user is a registered shop
    const shopUser = await User.findOne({ email: shopkeeperEmail, type: "shop" });
    if (!shopUser) {
      return res.status(403).json({
        message: "Only registered shop accounts can add items",
      });
    }

    // Check if the item already exists for this shop
    const existingItem = await Item.findOne({ shopkeeperEmail, itemName });

    if (existingItem) {
      // Update quantity instead of creating a new item
      existingItem.quantity += quantity;
      existingItem.amount = amount; // optional: update price if changed
      await existingItem.save();

      return res.status(200).json({
        message: "Item quantity updated successfully",
        item: existingItem,
      });
    }

    // Create new item if it doesn't exist
    const newItem = await Item.create({
      shopName,
      shopGstId,
      shopkeeperEmail,
      category,
      itemName,
      quantity,
      amount,
    });

    res.status(201).json({
      message: "Item added successfully",
      item: newItem,
    });
  } catch (err) {
    console.error("Error in addItem:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Update only the quantity of an existing item
export const updateQuantity = async (req, res) => {
  try {
    const { itemId, quantityToAdd } = req.body;

    if (!itemId || quantityToAdd === undefined) {
      return res.status(400).json({ message: "Item ID and quantity required" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Increment quantity
    item.quantity += quantityToAdd;
    await item.save();

    res.status(200).json({
      message: "Quantity updated successfully",
      item,
    });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
