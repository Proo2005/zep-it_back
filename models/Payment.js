import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    paymentMethod: { type: String, enum: ["UPI", "Card"], required: true },

    // For UPI
    upiNumber: { type: String },
    upiId: { type: String },

    // For Card
    cardNumber: { type: String },
    cvv: { type: String },
    expiry: { type: String },

    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
