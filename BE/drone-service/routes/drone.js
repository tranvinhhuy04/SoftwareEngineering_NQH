// routes/drone.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// ⭐ FIX QUAN TRỌNG: Import Drone model
const Drone = require("../models/Drone");

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://order-service:5003";


// =====================================================================
// 🚁 GET DRONE TRACKING
// =====================================================================
router.get("/tracking/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // ⭐ Lấy thông tin order từ order-service
    const orderRes = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`);
    const { order } = orderRes.data;

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ⭐ Fallback để luôn có toạ độ
    const restaurant = order.restaurantLocation || {
      latitude: 10.762622,
      longitude: 106.660172,
    };

    const customer = order.deliveryLocation || {
      latitude: 10.790081,
      longitude: 106.703516,
    };

    // ⭐ Drone thật nếu có
    const droneObj = await Drone.findOne({ assignedOrderId: orderId });

    const droneLocation = droneObj?.currentLocation || restaurant;

    res.json({
      orderId: order._id,
      orderStatus: order.orderStatus,
      deliveryMethod: order.deliveryMethod,
      restaurant,
      customer,
      drone: {
        id: droneObj?._id || null,
        name: droneObj?.name || droneObj?.code || "Drone X1",
        status: droneObj?.status || "in-transit",
        currentLocation: droneLocation,
      },
      lastUpdatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Error fetching drone tracking:", err.message);
    res.status(500).json({ message: "Failed to fetch drone tracking" });
  }
});



// =====================================================================
// 🚚 CUSTOMER CONFIRM DELIVERED
// =====================================================================
router.patch("/drones/:id/confirm-delivered", async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });

    drone.status = "idle";
    drone.assignedOrderId = null;
    drone.waitingForCustomerConfirmation = false;

    if (drone.baseLocation) {
      drone.currentLocation = drone.baseLocation;
    }

    await drone.save();

    res.json({ message: "Drone confirmed delivered and is idle", drone });

  } catch (err) {
    console.error("Failed to confirm drone delivered:", err.message);
    res.status(500).json({ message: "Error confirming delivered" });
  }
});


// ⭐ FIX QUAN TRỌNG: Export đúng vị trí, chỉ 1 lần duy nhất
module.exports = router;
