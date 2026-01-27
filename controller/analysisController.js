import Payment from "../models/Payment.js";

/**
 * GET /api/analysis/shop
 * Shopkeeper / Admin analytics
 */
export const getShopAnalysis = async (req, res) => {
  try {
    const user = req.user;

    if (user.type !== "shop" && user.type !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch successful payments only
    const payments = await Payment.find({ status: "success" });

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;
    const itemMap = {};

    const orders = [];

    payments.forEach((payment) => {
      let shopItemCount = 0;
      let shopAmount = 0;

      payment.items.forEach((item) => {
        if (item.addedBy?.email === user.email) {
          shopItemCount += item.quantity;
          shopAmount += item.price * item.quantity;
          totalItemsSold += item.quantity;

          // Track top items
          if (!itemMap[item.name]) {
            itemMap[item.name] = 0;
          }
          itemMap[item.name] += item.quantity;
        }
      });

      if (shopItemCount > 0) {
        totalOrders += 1;
        totalRevenue += shopAmount;

        orders.push({
          _id: payment._id,
          amount: shopAmount,
          itemsCount: shopItemCount,
          status: payment.status,
          createdAt: payment.createdAt,
        });
      }
    });

    const topItems = Object.entries(itemMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalItemsSold,
        avgOrderValue: totalOrders
          ? Math.round(totalRevenue / totalOrders)
          : 0,
      },
      orders,
      topItems,
    });
  } catch (err) {
    console.error("Shop analysis error:", err);
    res.status(500).json({ message: "Failed to load shop analytics" });
  }
};
