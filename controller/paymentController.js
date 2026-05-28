import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../lib/razorpay.js";
import Payment from "../models/Payment.js";
import Item from "../models/Item.js";
import Cart from "../models/Cart.js";

/* ---------------- CREATE ORDER ---------------- */
/* ---------------- CREATE ORDER (DIAGNOSTIC VERSION) ---------------- */
export const createOrder = async (req, res) => {
  try {
    console.log("1. Request received. Amount:", req.body.amount);
    
    // Check if the auth middleware is attaching the user correctly
    console.log("2. Auth User Object:", req.user); 
    
    const { amount, cart, cartCode } = req.body;

    if (!req.user || (!req.user.id && !req.user._id)) {
        throw new Error("Authentication failure: req.user is undefined or missing an ID.");
    }

    // Determine the correct user ID field based on your auth middleware
    const userId = req.user.id || req.user._id;

    console.log("3. Attempting to contact Razorpay...");
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });
    console.log("4. Razorpay Success! Order ID:", order.id);

    console.log("5. Attempting to save to MongoDB...");
    await Payment.create({
      user: userId, // Using the safely extracted ID
      cartCode: cartCode || null,
      items: cart, 
      amount,
      razorpay: {
        orderId: order.id,
      },
      status: "pending", 
    });
    console.log("6. MongoDB Save Success!");

    res.json(order);
  } catch (err) {
    // THIS WILL PRINT THE EXACT REASON FOR THE CRASH
    console.error("🚨 FATAL CRASH IN CREATE ORDER 🚨");
    console.error("Error Message:", err.message);
    if (err.error) console.error("Razorpay Details:", err.error.description);
    
    res.status(500).json({ message: "Order creation failed", error: err.message });
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
/* ---------------- PAYMENT HISTORY ---------------- */
export const getPayments = async (req, res) => {
  try {
    // Safely extract the ID based on your auth middleware
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const payments = await Payment.find({ 
      user: userId,
      status: "success" // Only send completed payments
    }).sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (err) {
    console.error("History Fetch Error:", err);
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