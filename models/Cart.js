import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number,
  addedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
  },
});

const cartSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    items: [cartItemSchema],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
