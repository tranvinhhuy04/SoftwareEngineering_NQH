const express = require("express");
const router = express.Router();

const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");   
const MenuItem = require("../models/MenuItem");

const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const axios = require("axios");

/* ============================================================
 * GET ALL RESTAURANTS
 * ============================================================ */
router.get("/getAllRestaurant", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================================================
 * GET RESTAURANTS BY OWNER
 * ============================================================ */
router.get("/api/restaurants-id", verifyToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user.id });
    res.json(restaurants);
  } catch {
    res.status(500).json({ message: "Internal server error" });
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
      const restaurant = await Restaurant.create({
        name: req.body.name,
        ownerId: req.user.id,
        isOpen: true,
        avatar: req.body.avatar || null,
        address: req.body.address || null,
        phone_number: req.body.phone_number || null,
      });

      res.json({ message: "Restaurant profile created", restaurant });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/* ============================================================
 * DELETE RESTAURANT (Only owner)
 * ============================================================ */
router.delete(
  "/profile/:id",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const restaurantId = req.params.id;

      console.log("🔥 DELETE → restaurantId FE gửi:", restaurantId);

      // 1️⃣ Kiểm tra có tồn tại restaurant không
      const restaurant = await Restaurant.findById(restaurantId);
      console.log("🟨 Restaurant tìm được:", restaurant);

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // 2️⃣ Kiểm tra đúng owner không (ownerId là String)
      if (restaurant.ownerId !== req.user.id) {
        console.log("❌ restaurant.ownerId:", restaurant.ownerId, "req.user.id:", req.user.id);
        return res.status(403).json({
          message: "You are not allowed to delete this restaurant",
        });
      }

      // 3️⃣ Kiểm tra restaurant có Category không
      const categoriesCount = await Category.countDocuments({
        restaurantId: restaurantId,
      });

      if (categoriesCount > 0) {
        return res.status(400).json({
          message:
            "Please delete all categories of this restaurant before deleting it.",
        });
      }

      // 4️⃣ Kiểm tra restaurant có Menu Items không (dùng MenuItem, KHÔNG phải Menu)
      const menuCount = await MenuItem.countDocuments({
        restaurantId: restaurantId,
      });

      if (menuCount > 0) {
        return res.status(400).json({
          message:
            "Please delete menu items of this restaurant before deleting it.",
        });
      }

      // 5️⃣ Xoá restaurant
      await Restaurant.findByIdAndDelete(restaurantId);

      res.json({
        message: "Restaurant deleted successfully",
        restaurantId,
      });
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);


module.exports = router;
