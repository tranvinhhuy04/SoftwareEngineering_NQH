const express = require("express");
const router = express.Router();
const axios = require("axios"); 
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
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
    const session = await Order.startSession();
    session.startTransaction();

    try {
      const {
        restaurantId,
        items,    
        deliveryLocation,
        restaurantLocation,
        deliveryMethod,
      } = req.body;

      const customerEmail = req.user.email;

      if (!restaurantId || !items?.length)
        return res.status(400).json({
          message: "restaurantId and items required",
        });

      // Tính tổng tiền
      const totalAmount = items.reduce(
        (sum, i) => sum + i.price_per_unit * i.quantity,
        0
      );

      // 1️⃣ Tạo Order cha
      const order = await Order.create(
        [
          {
            customerEmail,
            restaurantId,
            totalAmount,
            deliveryMethod: deliveryMethod || "delivery",
            deliveryLocation,
            restaurantLocation,
            status: "pending",
          }
        ],
        { session }
      );

      const createdOrder = order[0];

      // 2️⃣ Tạo OrderItem (child)
      const orderItems = items.map((it) => ({
        orderId: createdOrder._id,
        menuId: it.menuId,
        quantity: it.quantity,
        price_per_unit: it.price_per_unit,
        subtotal: it.price_per_unit * it.quantity,
      }));

      await OrderItem.insertMany(orderItems, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: "Order created successfully",
        order: createdOrder,
        items: orderItems,
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error("Create order error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ============================================================
   🧍 CUSTOMER – VIEW MY ORDERS
============================================================ */
router.get(
  "/customer",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const orders = await Order.find({
        customerEmail: req.user.email,
      });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  }
);

/* ============================================================
   🧑‍🍳 RESTAURANT – VIEW ORDERS
============================================================ */
router.get(
  "/restaurant/:restaurantId",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const orders = await Order.find({
        restaurantId: req.params.restaurantId,
      });

      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch orders" });
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
      const order = await Order.findById(req.params.id);

      if (!order)
        return res.status(404).json({ message: "Order not found" });

      order.orderStatus = "accepted";
      await order.save();

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
   🚚 DELIVERY + RESTAURANT – UPDATE STATUS
============================================================ */
router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("delivery", "restaurant"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      const allowed = ["accepted", "in-transit", "delivered"];
      if (!allowed.includes(status))
        return res.status(400).json({ message: "Invalid status" });

      const updateData = { orderStatus: status };

      if (req.user.role === "delivery" && status === "in-transit") {
        updateData.deliveryPersonEmail = req.user.email;
      }

      const order = await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
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
   📦 GET ORDER DETAILS (MENU + ITEMS MERGE)
============================================================ */
router.get("/details/:id", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Lấy order items
    const items = await OrderItem.find({
      orderId: orderId.toString(),
    });

    console.log("DEBUG ITEMS:", items);

    if (!items.length)
      return res.json({ order, items: [] });

    const menuIds = [...new Set(items.map(i => i.menuId.toString()))];

    const { data: menus } = await axios.post(
      "http://restaurant-service:5002/restaurant/menu/bulk",
      { ids: menuIds }
    );

    const menuMap = new Map(menus.map(m => [m._id.toString(), m]));

    const formattedItems = items.map(item => {
      const menu = menuMap.get(item.menuId.toString());
      return {
        _id: item._id,
        menuId: item.menuId,
        name: menu?.name || "Unknown",
        description: menu?.description || "",
        price: menu?.price || 0,
        image_url: menu?.image_url || "",
        categoryName: menu?.categoryName || "",
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        subtotal: item.subtotal,
      };
    });

    res.json({ order, items: formattedItems });

  } catch (err) {
    console.error("Error getting order details:", err);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

/* ============================================================
   📦 GET ONE ORDER
============================================================ */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Lấy order items
    const items = await OrderItem.find({ orderId: req.params.id });

    res.json({
      order,
      items,
    });

  } catch (err) {
    console.error("Error getting order details:", err);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

/* ============================================================
   🚚 DELIVERY SERVICE – FETCH DELIVERY PENDING ORDERS
============================================================ */
router.get("/delivery/orders", async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ["accepted", "in-transit"] }
    });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("Delivery orders fetch error:", err);
    res.status(500).json({ message: "Failed to fetch delivery orders" });
  }
});

module.exports = router;
