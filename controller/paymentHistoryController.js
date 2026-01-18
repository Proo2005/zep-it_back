import User from "../models/User.js";
import Payment from "../models/Payment.js";
import PaymentHistory from "../models/PaymentHistory.js";
import Item from "../models/Item.js";

export const processPayment = async (req, res) => {
  try {
    const { userName, email, paymentMethod, upiId, cardNumber, cvv, expiry, cart, totalAmount } = req.body;

    if (!userName || !email || !paymentMethod || !cart || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 1️⃣ Find saved payment details
    const savedPayment = await Payment.findOne({ email });
    if (!savedPayment) {
      return res.status(400).json({ success: false, message: "No payment method found for user" });
    }

    // 2️⃣ Validate payment details
    let isValid = false;
    if (paymentMethod === "UPI") isValid = savedPayment.upiId === upiId;
    if (paymentMethod === "Card") {
      isValid =
        savedPayment.cardNumber === cardNumber &&
        savedPayment.cvv === cvv &&
        savedPayment.expiry === expiry;
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid payment details" });
    }

    // 3️⃣ Deduct quantity from items
    const itemsForHistory = [];
    for (const cartItem of cart) {
      const item = await Item.findById(cartItem.itemId);
      if (!item) continue;

      item.quantity -= cartItem.quantity;
      if (item.quantity < 0) item.quantity = 0;
      await item.save();

      itemsForHistory.push({
        itemId: item._id,
        name: item.itemName,
        quantity: cartItem.quantity,
        amount: cartItem.price,
      });
    }

    // 4️⃣ Save payment history
    const user = await User.findOne({ email });
    const paymentHistory = await PaymentHistory.create({
      userId: user._id,
      userName,
      email,
      items: itemsForHistory,
      totalAmount,
      paymentMethod,
    });

    return res.status(201).json({ success: true, message: "Payment successful", paymentHistory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Payment failed", error: err.message });
  }
};

// Get all payment history for a user
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id; // set by auth middleware
    if (!userId) return res.status(400).json({ success: false, message: "User not logged in" });

    const history = await PaymentHistory.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch payment history" });
  }
};