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

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["customer", "shop"],
      required: true,
    },

    password: {
      type: String,
      required: true, // ✅ REQUIRED
    },

    address: {
      state: { type: String, required: true },
      city: { type: String, required: true },
      fullAddress: { type: String, required: true },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
