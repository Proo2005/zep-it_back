// controller/storeController.js
import Store from "../models/Store.js";

// GET all stores
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE new store
export const createStore = async (req, res) => {
  try {
    const {
      storeName,
      state,
      city,
      locationName,
      address,
      lat,
      lng,
      deliveryRadiusKm,
      isActive,
    } = req.body;

    if (!storeName || !state || !city || !locationName || !address || !lat || !lng) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const newStore = await Store.create({
      storeName,
      state,
      city,
      locationName,
      address,
      geo: {
        type: "Point",
        coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
      },
      deliveryRadiusKm: deliveryRadiusKm || 5,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, store: newStore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
