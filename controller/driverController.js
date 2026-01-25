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
    console.log("INCOMING DRIVER:", req.body);

    const driver = await Driver.create({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      vehicleNumber: req.body.vehicleNumber,
      vehicleType: req.body.vehicleType,
      rating: req.body.rating || 5,
    });

    res.status(201).json(driver);
  } catch (err) {
    console.error("DRIVER SAVE ERROR:", err);

    res.status(400).json({
      message: "Driver not saved",
      error: err.message,
    });
  }
};

