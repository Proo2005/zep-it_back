import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../lib/razorpay.js";
import Payment from "../models/Payment.js";
import Item from "../models/Item.js";
import Cart from "../models/Cart.js";

/* ---------------- CREATE ORDER ---------------- */
export const createOrder = async (req, res) => {
  try {
    // Receive the cart data from the frontend during initialization
    const { amount, cart, cartCode } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    // ✅ SAVE PENDING PAYMENT RECORD
    // This allows the webhook to access the cart data later without relying on the frontend
    await Payment.create({
      user: req.user.id,
      cartCode: cartCode || null,
      items: cart, 
      amount,
      razorpay: {
        orderId: order.id,
      },
      status: "pending", 
    });

    res.json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

/* ---------------- WEBHOOK: VERIFY PAYMENT + DEDUCT STOCK ---------------- */
export const verifyPaymentWebhook = async (req, res) => {
  // ✅ 1. VERIFY SIGNATURE (Server-to-Server)
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body)) // Razorpay requires the raw raw body for verification
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).send("Invalid signature");
  }

  // ✅ 2. ISOLATE SUCCESSFUL PAYMENTS
  if (req.body.event !== "payment.captured") {
    return res.status(200).send("Event ignored");
  }

  const paymentEntity = req.body.payload.payment.entity;
  const razorpay_order_id = paymentEntity.order_id;
  const razorpay_payment_id = paymentEntity.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Retrieve the pending payment generated in createOrder
    const payment = await Payment.findOne({
      "razorpay.orderId": razorpay_order_id,
      status: "pending",
    }).session(session);

    if (!payment) {
      throw new Error("Pending payment not found or already processed");
    }

    // ✅ CHECK STOCK + DEDUCT
    for (const cartItem of payment.items) {
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

    // ✅ UPDATE PAYMENT RECORD TO SUCCESS
    payment.status = "success";
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = signature;
    await payment.save({ session });

    // ✅ DELETE CART AFTER PAYMENT
    if (payment.cartCode) {
      await Cart.findOneAndDelete({ code: payment.cartCode }).session(session);
    } else {
      await Cart.findOneAndDelete({ user: payment.user }).session(session);
    }

    await session.commitTransaction();
    res.status(200).send("OK");
  } catch (err) {
    await session.abortTransaction();
    console.error("Webhook processing failed:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    session.endSession();
  }
};

/* ---------------- PAYMENT HISTORY ---------------- */
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      user: req.user.id,
      status: "success" // Ensure only successful payments are sent to the frontend
    }).sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
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