import express from "express";
import { getAllStores, createStore } from "../controller/storeController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL STORES
router.get("/", getAllStores);

// ADD STORE (protected)
router.post("/add", auth, createStore);

export default router;
