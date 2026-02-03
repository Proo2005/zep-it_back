import Payment from "../models/Payment.js";

/**
 * GET /api/analysis/monthly
 * Admin → full platform monthly analysis
 * Shop → own monthly sales
 */
export const getMonthlyAnalysis = async (req, res) => {
  try {
    const user = req.user;

    if (!["admin", "shop"].includes(user.type)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await Payment.find({ status: "success" });

    const monthlyMap = {};

    payments.forEach((payment) => {
      const monthKey = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM

      let monthRevenue = 0;
      let monthItems = 0;

      payment.items.forEach((item) => {
        const isAdmin = user.type === "admin";
        const isShopItem =
          user.type === "shop" &&
          item.addedBy?.email === user.email;

        if (isAdmin || isShopItem) {
          monthRevenue += item.price * item.quantity;
          monthItems += item.quantity;
        }
      });

      if (monthRevenue === 0) return;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          revenue: 0,
          orders: 0,
          itemsSold: 0,
        };
      }

      monthlyMap[monthKey].revenue += monthRevenue;
      monthlyMap[monthKey].itemsSold += monthItems;
      monthlyMap[monthKey].orders += 1;
    });

    const monthlyStats = Object.values(monthlyMap).sort(
      (a, b) => a.month.localeCompare(b.month)
    );

    res.json(monthlyStats);
  } catch (err) {
    console.error("Monthly analysis error:", err);
    res.status(500).json({ message: "Failed to load monthly analysis" });
  }
};
