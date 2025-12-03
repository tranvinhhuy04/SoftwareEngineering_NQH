const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

// GỌI TRỰC TIẾP order-service
const ORDER_SERVICE_URL = "http://order-service:5003";

/* ============================================================
   🚚 DELIVERY — GET ORDERS READY FOR DELIVERY
============================================================ */
router.get("/orders", verifyToken, allowRoles("delivery"), async (req, res) => {
  try {
    const response = await axios.get(
      `${ORDER_SERVICE_URL}/orders/delivery/orders`,
      { headers: { Authorization: req.headers.authorization } }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("Fetch delivery orders error:", err.message);
    return res.status(500).json({ message: "Fetch delivery orders failed" });
  }
});

/* ============================================================
   🚚 DELIVERY — CLAIM OR UPDATE STATUS
============================================================ */
router.patch(
  "/order/:id",
  verifyToken,
  allowRoles("delivery"),
  async (req, res) => {
    try {
      const orderId = req.params.id;
      const status = req.body.status || req.body.orderStatus;

      if (!status)
        return res.status(400).json({ message: "Status required" });

      // Gửi đúng body cho order-service
      const response = await axios.patch(
        `${ORDER_SERVICE_URL}/orders/${orderId}/status`,
        { orderStatus: status },
        { headers: { Authorization: req.headers.authorization } }
      );

      const order = response.data.order;

      // Publish event
      if (status === "in-transit") {
        await publishEvent("delivery.in_transit", {
          orderId,
          deliveryPersonEmail: req.user.email,
        });
      }

      if (status === "delivered") {
        await publishEvent("delivery.completed", {
          orderId,
          deliveryPersonEmail: req.user.email,
        });
      }

      return res.json({ message: "Delivery status updated", order });
    } catch (err) {
      console.error("Delivery update error:", err.message);
      return res.status(500).json({ message: "Cannot update delivery status" });
    }
  }
);

module.exports = router;
