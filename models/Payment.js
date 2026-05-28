import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartCode: {
      type: String,
      default: null,
    },

    items: [
      {
        itemId: String,
        name: String,
        price: Number,
        quantity: Number,
        addedBy: {
          name: String,
          email: String,
        },
      },
    ],

    amount: {
      type: Number,
      required: true,
    },

    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
