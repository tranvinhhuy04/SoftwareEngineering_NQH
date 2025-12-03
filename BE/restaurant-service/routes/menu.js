const express = require("express");
const axios = require("axios");
const router = express.Router();

const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { v2: cloudinary } = require("cloudinary");

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://order-service:5003";
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

    const formatted = menuItems.map((m) => ({
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
 * CREATE MENU ITEM (SUPPORT FILE UPLOAD)
 * ============================================================ */
router.post(
  "/menu",
  verifyToken,
  allowRoles("restaurant"),
  async (req, res) => {
    try {

      /* ===========================
       * 1) Xác thực restaurant
       * =========================== */
      const restaurant = await Restaurant.findOne({
        _id: req.body.restaurantId,
        ownerId: req.user.id,
      });

      if (!restaurant) {
        return res.status(403).json({
          message: "You do not own this restaurant",
        });
      }

      /* ===========================
       * 2) Category phải thuộc restaurant
       * =========================== */
      const category = await Category.findOne({
        _id: req.body.categoryId,
        restaurantId: req.body.restaurantId,
      });

      if (!category) {
        return res.status(400).json({
          message: "This category does not belong to your restaurant",
        });
      }

      /* ===========================
       * 3) Upload ảnh nếu có
       * =========================== */
      let image_url = null;

      if (req.files && req.files.image) {
        const file = req.files.image;

        const upload = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "food-delivery/menu",
        });

        image_url = upload.secure_url;
      }

      /* ===========================
       * 4) Tạo menu item
       * =========================== */
      const item = await MenuItem.create({
        name: req.body.name,
        description: req.body.description || null,
        price: parseFloat(req.body.price),
        categoryId: req.body.categoryId,
        restaurantId: req.body.restaurantId,
        image_url,
      });

      res.json({ message: "Menu item created", item });

    } catch (err) {
      console.error("Create menu error:", err);
      res.status(500).json({ message: "Internal server error" });
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

    res.json(
      menuItems.map((item) => ({
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        categoryId: item.categoryId?._id,
        categoryName: item.categoryId?.name,
      }))
    );

  } catch (err) {
    console.error("Get menu by restaurant error:", err);
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
      const menuId = req.params.id;
      console.log("Deleting menu item:", menuId);

      /* ====================================
       * 1) Lấy menu item
       * ==================================== */
      const menuItem = await MenuItem.findById(menuId);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      /* ====================================
       * 2) Kiểm tra owner có quyền xoá menu
       * ==================================== */
      const restaurant = await Restaurant.findOne({
        _id: menuItem.restaurantId,
        ownerId: req.user.id,
      });

      if (!restaurant) {
        return res.status(403).json({
          message: "You cannot delete menu items from another restaurant",
        });
      }

      /* ====================================
       * 3) CHECK ORDER SERVICE
       *    route đúng: /orders/check-menu/:id
       * ==================================== */
      let orderInUse = false;
      try {
        const orderCheck = await axios.get(
          `${ORDER_SERVICE_URL}/orders/check-menu/${menuId}`
        );

        orderInUse = orderCheck?.data?.inOrder === true;

      } catch (error) {
        // Nếu order-service trả về 404 → nghĩa là menu chưa từng nằm trong order
        if (error.response?.status !== 404) {
          console.error("Order-service error:", error.message);
          return res.status(500).json({
            message: "Order-service unavailable",
          });
        }
      }

      if (orderInUse) {
        return res.status(400).json({
          message: "Cannot delete menu item because it exists in active orders",
        });
      }

      /* ====================================
       * 4) CHECK CART SERVICE (nếu có)
       * ==================================== */
      let cartInUse = false;
      try {
        const cartCheck = await axios.get(
          `${ORDER_SERVICE_URL}/cart/check-menu/${menuId}`
        );

        cartInUse = cartCheck?.data?.inCart === true;

      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Cart-service error:", error.message);
          return res.status(500).json({
            message: "Cart-service unavailable",
          });
        }
      }

      if (cartInUse) {
        return res.status(400).json({
          message: "Cannot delete menu item because it exists in customer's cart",
        });
      }

      /* ====================================
       * 5) XÓA MENU
       * ==================================== */
      await menuItem.deleteOne();

      return res.json({ message: "Menu item deleted" });

    } catch (err) {
      console.error("Delete menu error:", err);
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
