import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["UPI", "Card"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PaymentHistory", paymentHistorySchema);
