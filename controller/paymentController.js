import Payment from "../models/Payment.js";

export const savePayment = async (req, res) => {
  try {
    const {
      userName,
      email,
      paymentMethod,
      upiNumber,
      upiId,
      cardNumber,
      cvv,
      expiry,
      amount,
    } = req.body;

    if (!userName || !email || !paymentMethod || !amount) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Simple validations
    if (paymentMethod === "UPI" && (!upiNumber || !upiId)) {
      return res.status(400).json({ message: "UPI details are required" });
    }

    if (
      paymentMethod === "Card" &&
      (!cardNumber || !cvv || !expiry || cardNumber.length !== 14 || cvv.length !== 3)
    ) {
      return res.status(400).json({ message: "Card details invalid" });
    }

    const payment = await Payment.create({
      userName,
      email,
      paymentMethod,
      upiNumber,
      upiId,
      cardNumber,
      cvv,
      expiry,
      amount,
    });

    res.status(201).json({ message: "Payment details saved", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getPaymentsByUser = async (req, res) => {
  try {
    const userEmail = req.user.email; // set by auth middleware
    if (!userEmail) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }

    const payments = await Payment.find({ email: userEmail }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment details" });
  }
};
