import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ["EV", "Petrol"],
      required: true,
    },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);
