import razorpay from "../lib/razorpay.js";
import Wallet from "../models/Wallet.js";

export const createWalletOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyWalletPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, amount } = req.body;
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      amount,
      type: "credit",
      razorpay_payment_id,
    });

    await wallet.save();

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export const getWallet = async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user.id });
  res.json(wallet);
};
