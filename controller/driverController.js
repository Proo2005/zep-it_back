import Driver from "../models/Driver.js";

/* Get all drivers */
export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drivers" });
  }
};

/* Add new driver */
export const addDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ message: "Failed to add driver" });
  }
};
