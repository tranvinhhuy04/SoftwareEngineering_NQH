// routes/delivery.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://order-service:5003";

/* ============================================================
   📦 GET ORDERS READY FOR DELIVERY
============================================================ */
router.get(
  "/orders",
  verifyToken,
  allowRoles("delivery"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `${ORDER_SERVICE_URL}/orders/delivery/orders`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      res.json(response.data);
    } catch (err) {
      console.error("Error fetching delivery orders:", err.message);
      res.status(500).json({ message: "Error fetching delivery orders" });
    }
  }
);

/* ============================================================
   🚚 DELIVERY CLAIM ORDER & UPDATE STATUS
============================================================ */
router.patch(
  "/order/:id",
  verifyToken,
  allowRoles("delivery"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status)
        return res
          .status(400)
          .json({ message: "Status is required (in-transit | delivered)" });

      const response = await axios.patch(
        `${ORDER_SERVICE_URL}/order/${id}/status`,
        { status },
        { headers: { Authorization: req.headers.authorization } }
      );

      const updatedOrder = response.data.order;

      // 🔔 Publish event
      if (status === "in-transit") {
        await publishEvent("delivery.in_transit", {
          orderId: id,
          deliveryPersonEmail: req.user.email,
        });
      }

      if (status === "delivered") {
        await publishEvent("delivery.completed", {
          orderId: id,
          deliveryPersonEmail: req.user.email,
        });
      }

      res.json({
        message: "Delivery status updated",
        order: updatedOrder,
      });
    } catch (err) {
      console.error("Delivery update error:", err.message);
      res.status(500).json({ message: "Failed to update delivery status" });
    }
  }
);

module.exports = router;
