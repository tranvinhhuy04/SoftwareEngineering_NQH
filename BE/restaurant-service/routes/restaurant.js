const express = require("express");
const router = express.Router();

const Restaurant = require("../models/Restaurant");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const axios = require("axios");

/* ============================================================
 * GET ALL RESTAURANTS (Public)
 * ============================================================ */
router.get("/getAllRestaurant", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================================================
 * GET RESTAURANTS BY OWNER
 * ============================================================ */
router.get("/api/restaurants-id", verifyToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user.id });
    res.json(restaurants);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================================================
 * CREATE RESTAURANT PROFILE
 * ============================================================ */
router.post(
  "/profile",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const restaurant = new Restaurant({
        name: req.body.name,
        ownerId: req.user.id,
        isOpen: true,
        avatar: req.body.avatar,
        address: req.body.address,
        phone_number: req.body.phone_number,
      });

      await restaurant.save();
      res.json({ message: "Restaurant profile created", restaurant });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

/* ============================================================
 * ACCEPT ORDER
 * ============================================================ */
router.post(
  "/accept-order",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ message: "orderId is required" });

      const ORDER_SERVICE_URL =
        process.env.ORDER_SERVICE_URL || "http://order-service:5003";

      const response = await axios.patch(
        `${ORDER_SERVICE_URL}/status/${orderId}`,
        { status: "accepted" },
        { headers: { Authorization: req.headers.authorization } }
      );

      return res.json({
        message: "Order accepted by restaurant",
        order: response.data.order,
      });

    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
