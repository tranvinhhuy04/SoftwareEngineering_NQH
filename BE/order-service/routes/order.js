const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

/* ============================================================
   🧍 CUSTOMER – CREATE ORDER
============================================================ */
router.post(
  "/create",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { restaurantId, items, paymentIntentId, deliveryLocation, restaurantLocation, deliveryMethod } = req.body;

      const customerEmail = req.user.email;  // ⭐ LẤY EMAIL từ token
      if (!customerEmail)
        return res.status(401).json({ message: "Missing email from token" });

      if (!restaurantId || !items?.length)
        return res.status(400).json({ message: "restaurantId and items required" });

      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const order = new Order({
        customerEmail,
        restaurantId,
        totalAmount,
        paymentIntentId,
        deliveryMethod: deliveryMethod || "delivery",
        deliveryLocation,
        restaurantLocation,
        items,
      });

      await order.save();

      res.status(201).json({ message: "Order created", order });
    } catch (err) {
      console.error("Create order error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


/* ============================================================
   🧍 CUSTOMER – VIEW OWN ORDERS
============================================================ */
router.get(
  "/customer",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const orders = await Order.find({ customerId: req.user.id });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);

/* ============================================================
   🧑‍🍳 RESTAURANT – VIEW ORDERS FOR THEIR RESTAURANTS
============================================================ */
router.get(
  "/restaurant/:restaurantId",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const orders = await Order.find({ restaurantId });
      res.json(orders);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ message: "Failed to fetch restaurant orders" });
    }
  }
);

/* ============================================================
   🧑‍🍳 RESTAURANT – ACCEPT ORDER
============================================================ */
router.patch(
  "/:id/accept",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.status = "accepted";
      await order.save();

      // 👉 Publish event
      await publishEvent("order.accepted", {
        orderId: order._id.toString(),
        customerEmail: order.customerEmail,
      });


      res.json({ message: "Order accepted", order });
    } catch (err) {
      console.error("Accept error:", err);
      res.status(500).json({ message: "Failed to accept order" });
    }
  }
);

/* ============================================================
   🚚 DELIVERY restaurant – UPDATE STATUS
============================================================ */
router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("delivery", "restaurant"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const valid = ["accepted", "in-transit", "delivered"];
      if (!valid.includes(status))
        return res.status(400).json({ message: "Invalid status" });

      const updateData = { orderStatus: status };

      if (req.user.role === "delivery" && status === "in-transit") {
        updateData.deliveryPersonEmail = req.user.email;
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: false } // 🔥 TẮT full validation
      );

      if (!order)
        return res.status(404).json({ message: "Order not found" });

      res.json({ message: "Status updated", order });

    } catch (err) {
      console.error("Status update error:", err);
      res.status(500).json({ message: "Failed to update status" });
    }
  }
);

/* ============================================================
   📦 GET SINGLE ORDER
============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

module.exports = router;
