import crypto from "crypto";
import razorpay from "../lib/razorpay.js";
import Payment from "../models/Payment.js";
import Item from "../models/Item.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";

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

/* ---------------- VERIFY PAYMENT + DEDUCT STOCK ---------------- */
export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
      amount,
      cartCode,
    } = req.body;

    // ✅ VERIFY SIGNATURE
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid signature" });
    }

    // ✅ CHECK STOCK + DEDUCT
    for (const cartItem of cart) {
      const item = await Item.findById(cartItem.itemId).session(session);

      if (!item) {
        throw new Error(`Item not found: ${cartItem.name}`);
      }

      if (item.quantity < cartItem.quantity) {
        throw new Error(`Not enough stock for ${cartItem.name}`);
      }

      // 🔻 deduct stock
      item.quantity -= cartItem.quantity;
      await item.save({ session });
    }

    // ✅ SAVE PAYMENT RECORD
    const payment = await Payment.create(
      [
        {
          user: req.user.id,
          cartCode: cartCode || null,
          items: cart, // keep as-is
          amount,
          razorpay: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
          },
          status: "success",
        },
      ],
      { session }
    );

    // ✅ OPTIONAL: delete cart after payment
    if (cartCode) {
      await Cart.findOneAndDelete({ code: cartCode }).session(session);
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Payment successful, stock updated",
      payment: payment[0],
      orderId: payment[0]._id,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({
      message: err.message || "Payment verification failed",
    });
  } finally {
    session.endSession();
  }
};


/* ---------------- PAYMENT HISTORY ---------------- */
export const getPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(payments);
};


/**
 * GET /api/payments/all
 * Admin → all payments
 * Shop → payments containing own items
 */
export const getAllPayments = async (req, res) => {
  try {
    const user = req.user;

    if (!["admin", "shop"].includes(user.type)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await Payment.find({ status: "success" })
      .sort({ createdAt: -1 })
      .lean();

    // SHOP → filter only own items
    const filteredPayments =
      user.type === "admin"
        ? payments
        : payments
            .map((payment) => {
              const shopItems = payment.items.filter(
                (item) => item.addedBy?.email === user.email
              );

              if (shopItems.length === 0) return null;

              return {
                ...payment,
                items: shopItems,
                amount: shopItems.reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0
                ),
              };
            })
            .filter(Boolean);

    res.json(filteredPayments);
  } catch (err) {
    console.error("Payment fetch error:", err);
    res.status(500).json({ message: "Failed to load payments" });
  }
};
