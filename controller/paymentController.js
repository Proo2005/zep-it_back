import crypto from "crypto";
import razorpay from "../lib/razorpay.js";
import Payment from "../models/Payment.js";

/* ---------------- CREATE ORDER ---------------- */
export const createOrder = async (req, res) => {
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

/* ---------------- VERIFY & SAVE PAYMENT ---------------- */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
      amount,
      cartCode,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }


    //  STOCK UPDATE 
    for (const cartItem of cart) {
      const item = await Item.findById(cartItem.itemId);

      if (!item) {
        return res.status(404).json({
          message: `Item not found: ${cartItem.name}`,
        });
      }

      if (item.quantity < cartItem.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${cartItem.name}`,
        });
      }

      // Deduct stock
      item.quantity -= cartItem.quantity;
      await item.save();
    }

    const payment = await Payment.create({
      user: req.user.id,
      cartCode: cartCode || null,
      items: cart,
      amount,
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
      status: "success",
    });

    res.json({
      success: true,
      message: "Payment successful & stock updated",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

/* ---------------- PAYMENT HISTORY ---------------- */
export const getPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(payments);
};
