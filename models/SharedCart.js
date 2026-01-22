const mongoose = require("mongoose");

const sharedCartSchema = new mongoose.Schema(
  {
    cartCode: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    items: [
      {
        itemId: { type: String, required: true },
        name: String,
        price: Number,
        quantity: Number,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedCart", sharedCartSchema);
