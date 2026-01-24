import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const sharedCartSchema = new mongoose.Schema(
  {
    cartCode: {
      type: String,
      unique: true,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [cartItemSchema],
    payments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: Number,
        paidAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SharedCart", sharedCartSchema);
