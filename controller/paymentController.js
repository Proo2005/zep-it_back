import Payment from "../models/Payment.js";

// Save payment method
export const addPayment = async (req, res) => {
  try {
    const { paymentMethod, upiNumber, upiId, cardNumber, cvv, expiry, amount } =
      req.body;

    const { email, name } = req.user;

    if (!paymentMethod || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (paymentMethod === "UPI" && (!upiNumber || !upiId)) {
      return res.status(400).json({ message: "UPI details required" });
    }

    if (paymentMethod === "Card" && (!cardNumber || !cvv || !expiry)) {
      return res.status(400).json({ message: "Card details required" });
    }

    const payment = await Payment.create({
      userName: name,
      email,
      paymentMethod,
      upiNumber,
      upiId,
      cardNumber,
      cvv,
      expiry,
      amount,
    });

    res.status(201).json({
      success: true,
      message: "Payment method added",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all payments for logged-in user
export const getPaymentsByUser = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    const payments = await Payment.find({ email: userEmail }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch payment details", error: err.message });
  }
};
