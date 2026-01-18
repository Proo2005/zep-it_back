import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
dotenv.config();
connectDB();


import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.js";
import { getShopAnalysis } from "./controller/shopAnalysisController.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/paymenthistory", paymentHistoryRoutes);
app.use("/api/shop-analysis", getShopAnalysis);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
