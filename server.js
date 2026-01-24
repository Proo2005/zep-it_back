import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import walletRoutes from "./routes/walletRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import { getShopAnalysis } from "./controller/shopAnalysisController.js";
import contactRoutes from  "./routes/contactRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import splitRoutes from "./routes/splitRoutes.js"

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "https://zep-it-front.vercel.app",
  credentials: true, // if you’re using cookies
}));

app.use(express.json());

app.use(express.json());

// ROUTES
app.use("/api/store", storeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/paymenthistory", paymentHistoryRoutes);
app.use("/api/shop-analysis", getShopAnalysis);
app.use("/api/wallet", walletRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/split", splitRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
