import Payment from "../models/Payment.js";

/**
 * GET /api/analysis/shop
 * Shopkeeper → own sales
 * Admin → full platform sales
 */
export const getShopAnalysis = async (req, res) => {
  try {
    const user = req.user;

    if (user.type !== "shop" && user.type !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await Payment.find({ status: "success" });

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;
    const itemMap = {};
    const orders = [];

    payments.forEach((payment) => {
      let orderItemCount = 0;
      let orderAmount = 0;

      payment.items.forEach((item) => {
        // ✅ ADMIN → count everything
        const isAdmin = user.type === "admin";

        // ✅ SHOP → count only own items
        const isShopItem =
          user.type === "shop" &&
          item.addedBy?.email === user.email;

        if (isAdmin || isShopItem) {
          orderItemCount += item.quantity;
          orderAmount += item.price * item.quantity;
          totalItemsSold += item.quantity;

          if (!itemMap[item.name]) {
            itemMap[item.name] = 0;
          }
          itemMap[item.name] += item.quantity;
        }
      });

      // only push order if relevant items exist
      if (orderItemCount > 0) {
        totalOrders += 1;
        totalRevenue += orderAmount;

        orders.push({
          _id: payment._id,
          amount: orderAmount,
          itemsCount: orderItemCount,
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
