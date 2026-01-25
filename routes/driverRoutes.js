import express from "express";
import { getDrivers, addDriver } from "../controller/driverController.js";

const router = express.Router();

router.get("/", getDrivers);
router.post("/", addDriver);

export default router;
