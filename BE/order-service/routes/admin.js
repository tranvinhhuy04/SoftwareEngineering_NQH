const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const axios = require("axios");

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://auth-service:5001";
const RESTAURANT_SERVICE_URL =
  process.env.RESTAURANT_SERVICE_URL || "http://restaurant-service:5002";

const http = axios.create({ timeout: 3000 });


/* ============================================================
   📦 GET ALL ORDERS FOR ADMIN (FULL LIST, NO FILTER)
============================================================ */
router.get("/all", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ============================================================
   📊 ADMIN DASHBOARD – FULL STATISTICS (MATCH SCHEMA 100%)
============================================================ */
/* ============================================================
   📊 ADMIN DASHBOARD – FULL STATISTICS (ALL ORDERS, NO FILTER)
============================================================ */
router.get("/stats", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    // 👉 Đếm toàn bộ đơn không lọc trạng thái
    const totalOrders = await Order.countDocuments({});

    // 👉 Tổng doanh thu (tất cả orders)
    const totalRevenueAgg = await Order.aggregate([
      { $match: {} },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 👉 Breakdown theo restaurant
    const restaurantAgg = await Order.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "$restaurantId",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 👉 Breakdown theo shipper
    const deliveryAgg = await Order.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "$deliveryPersonEmail",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 👉 Breakdown theo customer
    const customerAgg = await Order.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "$customerEmail",
          orders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]);

    /* --------------------------------------------------------
       Fetch restaurant names
    -------------------------------------------------------- */
    let restaurantNames = {};
    try {
      const resp = await http.get(`${RESTAURANT_SERVICE_URL}/api/restaurants`);
      if (Array.isArray(resp.data)) {
        resp.data.forEach((r) => {
          restaurantNames[r._id?.toString()] = r.name || "Restaurant";
        });
      }
    } catch (e) {
      console.warn("⚠ Failed to fetch restaurant names:", e.message);
    }

    /* --------------------------------------------------------
       Fetch user info using email
    -------------------------------------------------------- */
    async function getUserInfo(emails) {
      if (!emails.length) return {};

      try {
        const resp = await http.post(
          `${AUTH_SERVICE_URL}/admin/users/bulk-info-email`,
          { emails }
        );

        const map = {};
        resp.data.forEach((u) => {
          map[u.email] = u;
        });
        return map;
      } catch {
        return {};
      }
    }

    const deliveryEmails = deliveryAgg.map((d) => d._id).filter(Boolean);
    const customerEmails = customerAgg.map((c) => c._id).filter(Boolean);

    const deliveryUsers = await getUserInfo(deliveryEmails);
    const customerUsers = await getUserInfo(customerEmails);

    /* --------------------------------------------------------
       Revenue share function
    -------------------------------------------------------- */
    function calcShares(total) {
      return {
        restaurant: Math.round(total * 0.8),
        delivery: Math.round(total * 0.15),
        platform: Math.round(total * 0.05),
      };
    }

    /* --------------------------------------------------------
       Format responses
    -------------------------------------------------------- */
    const restaurantBreakdown = restaurantAgg.map((r) => ({
      restaurantId: r._id,
      restaurantName: restaurantNames[r._id] || r._id,
      orders: r.orders,
      revenue: r.revenue,
      shares: calcShares(r.revenue),
    }));

    const deliveryBreakdown = deliveryAgg.map((d) => ({
      deliveryEmail: d._id,
      deliveryName: deliveryUsers[d._id]?.name || d._id,
      orders: d.orders,
      revenue: d.revenue,
      shares: calcShares(d.revenue),
    }));

    const customerBreakdown = customerAgg.map((c) => ({
      customerEmail: c._id,
      customerName: customerUsers[c._id]?.name || "-",
      email: c._id,
      orders: c.orders,
      totalSpent: c.totalSpent,
    }));

    /* --------------------------------------------------------
       FINAL RESPONSE
    -------------------------------------------------------- */
    res.json({
      totalOrders,
      totalRevenue,
      restaurantAgg: restaurantBreakdown,
      deliveryAgg: deliveryBreakdown,
      customerAgg: customerBreakdown,
    });
  } catch (err) {
    console.error("❌ Admin stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});


module.exports = router;
