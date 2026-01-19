import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    paymentMethod: { type: String, enum: ["UPI", "Card"], required: true },

    upiNumber: String,
    upiId: String,

    cardNumber: String,
    cvv: String,
    expiry: String,

    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
