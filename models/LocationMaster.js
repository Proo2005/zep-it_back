const mongoose = require("mongoose");

const locationMasterSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
    },

    locations: [
      {
        name: { type: String, required: true }, // eg: "Indiranagar"
        lat: Number,
        lng: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LocationMaster", locationMasterSchema);
