const express = require("express");
const router = express.Router();

const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { v2: cloudinary } = require("cloudinary");

/* ============================================================
 * BULK MENU LOOKUP – USED BY ORDER-SERVICE
 * ============================================================ */
router.post("/menu/bulk", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "ids must be array" });
    }

    const menuItems = await MenuItem.find({ _id: { $in: ids } })
      .populate("categoryId", "name");

    // Chuẩn hoá output cho order-service
    const formatted = menuItems.map(m => ({
      _id: m._id,
      name: m.name,
      description: m.description,
      price: m.price,
      image_url: m.image_url,
      categoryId: m.categoryId?._id,
      categoryName: m.categoryId?.name,
      restaurantId: m.restaurantId,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Bulk menu lookup error:", err);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

/* ============================================================
 * CREATE MENU ITEM (FILE UPLOAD → CLOUDINARY)
 * ============================================================ */
router.post(
  "/menu",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      // 1) Tìm restaurant theo owner
      const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // 2) Check category thuộc restaurant này
      const category = await Category.findOne({
        _id: req.body.categoryId,
        restaurantId: restaurant._id,
      });

      if (!category) {
        return res.status(400).json({
          message: "This category does not belong to your restaurant",
        });
      }

      // 3) Upload ảnh lên Cloudinary (nếu có)
      let image_url = null;

      if (req.files && req.files.image) {
        const file = req.files.image;

        const upload = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "food-delivery/menu",
        });

        image_url = upload.secure_url;
      }

      // 4) Tạo menu item
      const item = await MenuItem.create({
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        categoryId: req.body.categoryId,
        restaurantId: restaurant._id,
        image_url,
      });

      return res.json({ message: "Menu item created", item });
    } catch (err) {
      console.error("Create menu error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);


/* ============================================================
 * GET MENU BY RESTAURANT
 * ============================================================ */
router.get("/:restaurantId/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    }).populate("categoryId", "name");

    res.json(menuItems.map((item) => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      categoryId: item.categoryId?._id,
      categoryName: item.categoryId?.name,
    })));

  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ============================================================
 * DELETE MENU ITEM
 * ============================================================ */
router.delete(
  "/menu/:id",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({ ownerId: req.user.id });

      const menuItem = await MenuItem.findById(req.params.id);

      if (!menuItem)
        return res.status(404).json({ message: "Menu item not found" });

      if (menuItem.restaurantId.toString() !== restaurant._id.toString())
        return res.status(403).json({
          message: "You cannot delete menu items from another restaurant",
        });

      await menuItem.deleteOne();
      res.json({ message: "Menu item deleted" });

    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
/* ============================================================
 * GET SINGLE MENU ITEM
 * ============================================================ */
router.get("/menu/item/:id", async (req, res) => {
  try {
    const menu = await MenuItem.findById(req.params.id)
      .populate("categoryId", "name");

    if (!menu) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({
      _id: menu._id,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      image_url: menu.image_url,
      categoryId: menu.categoryId?._id,
      categoryName: menu.categoryId?.name,
      restaurantId: menu.restaurantId,
    });

  } catch (err) {
    console.error("Get single menu item error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
