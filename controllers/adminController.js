import Order from "../models/Order.js";
import Meal from "../models/Meal.js";
import User from "../models/User.js";

// GET /api/admin/stats (admin only)
export const getStats = async (req, res, next) => {
  try {
    const orders = await Order.find();
    const totalMeals = await Meal.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });

    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.pricing.total, 0);

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Revenue for the last 7 days, oldest first - feeds the dashboard's bar chart.
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const dayKey = day.toDateString();

      const dayRevenue = orders
        .filter(
          (o) => o.status !== "Cancelled" && new Date(o.createdAt).toDateString() === dayKey
        )
        .reduce((sum, o) => sum + o.pricing.total, 0);

      return { label: day.toLocaleDateString("en-IN", { weekday: "short" }), value: dayRevenue };
    });

    res.json({
      totalOrders: orders.length,
      totalRevenue: revenue,
      totalCustomers,
      totalMeals,
      statusCounts,
      last7Days,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/customers (admin only)
export const getCustomers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "customer" });
    const orders = await Order.find();

    const customers = users.map((u) => {
      const userOrders = orders.filter((o) => String(o.userId) === String(u._id));
      const totalSpent = userOrders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + o.pricing.total, 0);

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
        orderCount: userOrders.length,
        totalSpent,
      };
    });

    res.json(customers);
  } catch (error) {
    next(error);
  }
};