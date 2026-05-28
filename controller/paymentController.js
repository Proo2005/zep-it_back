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
      status: "success", // Set to pending if you want to wait for webhook confirmation
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
/* ---------------- WEBHOOK: VERIFY PAYMENT + DEDUCT STOCK (DIAGNOSTIC) ---------------- */
export const verifyPaymentWebhook = async (req, res) => {
  console.log("\n----- 🔔 NEW WEBHOOK RECEIVED -----");
  
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.error("🚨 ERROR: RAZORPAY_WEBHOOK_SECRET is missing from .env file!");
      return res.status(500).send("Server config error");
    }

    console.log("1. Checking Signature...");
    // Note: If this fails, we may need to use raw body parsing in server.js
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body)) 
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("🚨 ERROR: Signature Mismatch!");
      console.error("Expected:", expectedSignature);
      console.error("Received:", signature);
      return res.status(400).send("Invalid signature");
    }
    console.log("✅ Signature Verified!");

    console.log("2. Checking Event Type...");
    if (req.body.event !== "payment.captured") {
      console.log(`⚠️ Ignored Event: ${req.body.event}`);
      return res.status(200).send("Event ignored");
    }
    console.log("✅ Event is payment.captured!");

    const paymentEntity = req.body.payload.payment.entity;
    const razorpay_order_id = paymentEntity.order_id;
    
    console.log(`3. Looking for Pending Order ID in DB: ${razorpay_order_id}...`);
    
    // Temporarily dropping the 'session' here just in case local MongoDB Replica Sets are causing the crash
    const payment = await Payment.findOne({
      "razorpay.orderId": razorpay_order_id,
      status: "pending",
    });

    if (!payment) {
      console.error("🚨 ERROR: Pending payment not found in database!");
      return res.status(404).send("Payment not found");
    }
    console.log("✅ Pending Order Found in DB!");

    console.log("4. Updating Database Status...");
    payment.status = "success";
    payment.razorpay.paymentId = paymentEntity.id;
    payment.razorpay.signature = signature;
    await payment.save();
    console.log("✅ Database Updated to Success!");

    res.status(200).send("OK");
    console.log("----- ✅ WEBHOOK COMPLETE -----\n");

  } catch (err) {
    console.error("🚨 FATAL WEBHOOK CRASH:", err.message);
    res.status(500).send("Internal Server Error");
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
      status: { $in: ["success", "pending"] } // Send both completed and pending payments
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