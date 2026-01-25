import Driver from "../models/Driver.js";

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addDriver = async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);

    const driver = await Driver.create(req.body);

    console.log("✅ SAVED DRIVER:", driver);

    res.status(201).json(driver);
  } catch (err) {
    console.error("❌ SAVE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
