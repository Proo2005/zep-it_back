import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true, trim: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    locationName: { type: String, required: true },
    address: { type: String, required: true },

    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    deliveryRadiusKm: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

storeSchema.index({ geo: "2dsphere" });

export default mongoose.model("Store", storeSchema);
