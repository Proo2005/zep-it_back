const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["customer", "shop"],
      default: "customer",
    },

    password: {
      type: String,
      required: false, // 🔥 IMPORTANT
    },

    address: {
      state: { type: String, default: "N/A" },
      city: { type: String, default: "N/A" },
      fullAddress: { type: String, default: "N/A" },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
