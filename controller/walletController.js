import Wallet from "../models/Wallet.js";

// GET WALLET
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user.id });
    }

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADD MONEY
export const addMoney = async (req, res) => {
  try {
    const { amount, upiId } = req.body;

    if (!amount || amount <= 0 || !upiId) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // Simple UPI validation
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: "Invalid UPI ID" });
    }

    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user.id });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    res.json({
      success: true,
      message: "Money added successfully",
      balance: wallet.balance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
