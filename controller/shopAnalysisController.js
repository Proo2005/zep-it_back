import PaymentHistory from "../models/PaymentHistory.js";

export const getShopAnalysis = async (req, res) => {
  try {

    
    const now = new Date();

    // ---- TOTAL SALES ----
    const totalStats = await PaymentHistory.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // ---- TOTAL ITEMS SOLD ----
    const itemsSold = await PaymentHistory.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$items.quantity" }
        }
      }
    ]);

    // ---- PAYMENT METHOD SPLIT ----
    const paymentSplit = await PaymentHistory.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // ---- WEEKLY SALES ----
    const weekly = await PaymentHistory.aggregate([
      {
        $group: {
          _id: { $week: "$createdAt" },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ---- MONTHLY SALES ----
    const monthly = await PaymentHistory.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalOrders: totalStats[0]?.totalOrders || 0,
      totalItemsSold: itemsSold[0]?.totalQuantity || 0,
      paymentSplit,
      weekly,
      monthly
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Analysis failed" });
  }
};
