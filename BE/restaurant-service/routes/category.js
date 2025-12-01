const express = require("express");
const router = express.Router();

const Category = require("../models/Category");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");

/* ============================================================
 * CREATE CATEGORY
 * ============================================================ */
router.post(
  "/category",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
      if (!restaurant)
        return res.status(404).json({ message: "Restaurant not found" });

      const category = new Category({
        name: req.body.name,
        description: req.body.description || null,
        restaurantId: restaurant._id,
      });

      await category.save();
      res.json({ message: "Category created", category });

    } catch (err) {
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

module.exports = router;
