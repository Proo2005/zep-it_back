import PaymentHistory from "../models/PaymentHistory.js"; // path to your model


export const getShopAnalysis = async () => {
  try {
    // Total Revenue
    const totalRevenueAgg = await PaymentHistory.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalOrders = totalRevenueAgg[0]?.totalOrders || 0;

    // Total Items Sold
    const totalItemsSoldAgg = await PaymentHistory.aggregate([
      { $unwind: "$items" },
      { $group: { _id: null, totalItemsSold: { $sum: "$items.quantity" } } },
    ]);
    const totalItemsSold = totalItemsSoldAgg[0]?.totalItemsSold || 0;

    // Payment Method Split
    const paymentSplit = await PaymentHistory.aggregate([
      { $group: { _id: "$paymentMethod", amount: { $sum: "$totalAmount" } } },
    ]);

    // Weekly Sales Trend (last 8 weeks)
    const weekly = await PaymentHistory.aggregate([
      {
        $group: {
          _id: { $isoWeek: "$createdAt" },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Monthly Sales Trend (last 12 months)
    const monthly = await PaymentHistory.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      paymentSplit,
      weekly,
      monthly,
    };
  } catch (err) {
    console.error("Shop analysis error:", err);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalItemsSold: 0,
      paymentSplit: [],
      weekly: [],
      monthly: [],
    };
  }
};
