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
/* ============================================================
   📊 ADMIN DASHBOARD – FULL STATISTICS (ALL ORDERS, NO FILTER)
============================================================ */
router.get("/stats", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    console.log("MongoDB name:", Order.db.name);
    console.log("MongoDB collection:", Order.collection.name);
    console.log("Count all orders:", await Order.countDocuments({}));

    // ⛳ 1) Chỉ tính đơn hàng đã giao thành công
    const deliveredFilter = { orderStatus: "delivered" };

    // Tổng số đơn delivered
    const totalOrders = await Order.countDocuments(deliveredFilter);

    // Tổng doanh thu delivered
    const totalRevenueAgg = await Order.aggregate([
      { $match: deliveredFilter },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Báo cáo theo nhà hàng — chỉ delivered
    const restaurantAgg = await Order.aggregate([
      { $match: deliveredFilter },
      {
        $group: {
          _id: "$restaurantId",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Báo cáo theo tài xế — chỉ delivered
    const deliveryAgg = await Order.aggregate([
      { $match: deliveredFilter },
      {
        $group: {
          _id: "$deliveryPersonEmail",   // ✔ FIX đúng schema
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Báo cáo theo khách hàng — chỉ delivered
    const customerAgg = await Order.aggregate([
      { $match: deliveredFilter },
      {
        $group: {
          _id: "$customerEmail",        // ✔ FIX đúng schema
          orders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]);

    /* --------------------------------------------------------------------
       2) Lấy thông tin restaurant + user để map tên vào bảng Breakdown
    -------------------------------------------------------------------- */

    let restaurantNames = {};
    try {
      const resp = await http.get(`${RESTAURANT_SERVICE_URL}/api/restaurants`);
      if (Array.isArray(resp.data)) {
        resp.data.forEach((r) => {
          restaurantNames[r._id] = r.name;
        });
      }
    } catch (e) {
      console.warn("Warning: failed to fetch restaurant names:", e.message);
    }

    async function getUserNames(emails) {
      if (!emails.length) return {};
      try {
        const resp = await http.post(
          `${AUTH_SERVICE_URL}/admin/users/bulk-info`,
          { emails }
        );
        const map = {};
        resp.data.forEach((u) => {
          map[u.email] = u;
        });
        return map;
      } catch (e) {
        return {};
      }
    }

    const deliveryEmails = deliveryAgg.map((d) => d._id).filter(Boolean);
    const customerEmails = customerAgg.map((c) => c._id).filter(Boolean);

    const deliveryUsers = await getUserNames(deliveryEmails);
    const customerUsers = await getUserNames(customerEmails);

    // Logic chia shares
    function calcShares(total) {
      return {
        restaurant: Math.round(total * 0.8),
        delivery: Math.round(total * 0.15),
        platform: Math.round(total * 0.05),
      };
    }

    /* --------------------------------------------------------------------
       3) Format breakdown trả về cho FE
    -------------------------------------------------------------------- */

    const restaurantBreakdown = restaurantAgg.map((r) => ({
      restaurantName: restaurantNames[r._id] || r._id,
      orders: r.orders,
      revenue: r.revenue,
      shares: calcShares(r.revenue),
    }));

    const deliveryBreakdown = deliveryAgg.map((d) => ({
      deliveryName: deliveryUsers[d._id]?.username || d._id || "Unknown",
      orders: d.orders,
      revenue: d.revenue,
      shares: calcShares(d.revenue),
    }));

    const customerBreakdown = customerAgg.map((c) => ({
      customerName: c._id,
      email: customerUsers[c._id]?.username || c._id || "-",
      orders: c.orders,
      totalSpent: c.totalSpent,
    }));

    /* --------------------------------------------------------------------
       4) Response JSON trả về FE
    -------------------------------------------------------------------- */

    res.json({
      totalOrders,
      totalRevenue,
      restaurantAgg: restaurantBreakdown,
      deliveryAgg: deliveryBreakdown,
      customerAgg: customerBreakdown,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err.message);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

// ✅ Get delivered count for a given drone (admin)
router.get(
  "/drone/:droneId/delivered-count",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { droneId } = req.params;
      if (!droneId) return res.status(400).json({ message: "Missing droneId" });

      const filter = {
        status: "delivered",
        deliveryMethod: "drone",
        $or: [{ droneId: droneId }, { "drone.droneId": droneId }],
      };

      const count = await Order.countDocuments(filter);
      res.json({ droneId, delivered: count });
    } catch (err) {
      console.error("Error fetching drone delivered count:", err.message);
      res.status(500).json({ message: "Failed to fetch delivered count" });
    }
  }
);

// ✅ Check if restaurant has any orders (admin)
router.get(
  "/restaurant/:restaurantId/has-orders",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { restaurantId } = req.params;
      if (!restaurantId) {
        return res.status(400).json({ message: "Missing restaurantId" });
      }

      const count = await Order.countDocuments({ restaurantId });
      res.json({
        restaurantId,
        hasOrders: count > 0,
        orderCount: count
      });
    } catch (err) {
      console.error("Error checking restaurant orders:", err.message);
      res.status(500).json({ message: "Failed to check restaurant orders" });
    }
  }
);

// ✅ Get order counts for multiple customers (admin)
router.post(
  "/customers/order-counts",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { customerIds } = req.body;
      if (!customerIds || !Array.isArray(customerIds)) {
        return res.status(400).json({ message: "Missing or invalid customerIds" });
      }

      const counts = await Order.aggregate([
        { $match: { customerId: { $in: customerIds } } },
        { $group: { _id: "$customerId", count: { $sum: 1 } } }
      ]);

      const countMap = {};
      counts.forEach(item => {
        countMap[item._id] = item.count;
      });

      res.json(countMap);
    } catch (err) {
      console.error("Error getting customer order counts:", err.message);
      res.status(500).json({ message: "Failed to get order counts" });
    }
  }
);

// ✅ Get order counts for multiple restaurants (admin)
router.post(
  "/restaurants/order-counts",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { restaurantIds } = req.body;
      if (!restaurantIds || !Array.isArray(restaurantIds)) {
        return res.status(400).json({ message: "Missing or invalid restaurantIds" });
      }

      const counts = await Order.aggregate([
        { $match: { restaurantId: { $in: restaurantIds } } },
        { $group: { _id: "$restaurantId", count: { $sum: 1 } } }
      ]);

      const countMap = {};
      counts.forEach(item => {
        countMap[item._id] = item.count;
      });

      res.json(countMap);
    } catch (err) {
      console.error("Error getting restaurant order counts:", err.message);
      res.status(500).json({ message: "Failed to get order counts" });
    }
  }
);


module.exports = router;
