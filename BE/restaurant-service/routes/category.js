const express = require("express");
const router = express.Router();

const Category = require("../models/Category");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");

/* ============================================================
 * CREATE CATEGORY (Dùng đúng restaurantId client chọn)
 * ============================================================ */
router.post(
  "/category",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const { name, description, restaurantId } = req.body;

      console.log("📌 Received from client:", req.body);

      // 1) Validate required field
      if (!restaurantId)
        return res.status(400).json({ message: "restaurantId is required" });

      // 2) Kiểm tra owner có quyền tạo category cho restaurant này không
      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        ownerId: req.user.id, // 🔥 chỉ cho phép tạo category cho restaurant của mình
      });

      if (!restaurant)
        return res.status(403).json({
          message: "You do not own this restaurant",
        });

      // 3) Create category
      const category = new Category({
        name,
        description: description || null,
        restaurantId,  // 🔥 Gán đúng ID mà client chọn
      });

      await category.save();

      res.json({
        message: "Category created successfully",
        category,
      });

    } catch (err) {
      console.error("❌ CATEGORY ERROR:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);


/* ============================================================
 * GET CATEGORY BY RESTAURANT
 * ============================================================ */
router.get("/:restaurantId/category", async (req, res) => {
  try {
    const categories = await Category.find({ restaurantId: req.params.restaurantId });
    res.json(categories);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================================================
 * DELETE CATEGORY
 * ============================================================ */
router.delete(
  "/category/:id",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
      if (!restaurant)
        return res.status(404).json({ message: "Restaurant not found" });

      const category = await Category.findOne({
        _id: req.params.id,
        restaurantId: restaurant._id,
      });

      if (!category)
        return res.status(404).json({ message: "Category not found" });

      const menuExists = await MenuItem.findOne({ categoryId: req.params.id });
      if (menuExists)
        return res.status(400).json({
          message: "Cannot delete category because menu items exist",
        });

      await category.deleteOne();
      res.json({ message: "Category deleted" });

    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
/* ============================================================
 * GET CATEGORY BY ID  (Dùng cho trang EditCategory)
 * ============================================================ */
router.get(
  "/category/:id",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Kiểm tra category này có thuộc restaurant của owner hay không
      const restaurant = await Restaurant.findOne({
        _id: category.restaurantId,
        ownerId: req.user.id
      });

      if (!restaurant) {
        return res.status(403).json({ message: "You do not own this category" });
      }

      res.json(category);
    } catch (err) {
      console.error("❌ GET CATEGORY ERROR:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
/* ============================================================
 * UPDATE CATEGORY
 * ============================================================ */
router.put(
  "/category/:id",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const { name, description, restaurantId } = req.body;

      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });

      // Kiểm tra category có thuộc owner không
      const restaurant = await Restaurant.findOne({
        _id: category.restaurantId,
        ownerId: req.user.id,
      });

      if (!restaurant)
        return res.status(403).json({
          message: "You do not own this category",
        });

      // Update
      category.name = name;
      category.description = description;
      category.restaurantId = restaurantId;

      await category.save();

      res.json({
        message: "Category updated successfully",
        category,
      });
    } catch (err) {
      console.error("❌ UPDATE CATEGORY ERROR:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
