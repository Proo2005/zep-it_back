import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    shopGstId: { type: String, required: true },
    shopkeeperEmail: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "grocery_and_kitchen",
        "snacks_and_drinks",
        "beauty_and_personal_care",
        "household_essential",
      ],
      required: true,
    },

    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
