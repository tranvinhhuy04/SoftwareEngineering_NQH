const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");

/* ============================================================
   🧬 helper – LẤY userId TỪ req.user (id / _id / userId / email)
============================================================ */
const getUserIdFromReq = (req) => {
  if (!req.user) return null;

  // In ra để debug xem thực tế auth trả gì
  console.log("🔎 req.user in cart:", req.user);

  const id =
    req.user.id ||        // trường hợp /auth/me trả { id, email, role }
    req.user._id ||       // trường hợp Mongo trả { _id, email, ... }
    req.user.userId ||    // trường hợp bạn tự đặt tên userId
    req.user.uid ||       // kiểu Firebase hoặc tuỳ bạn
    req.user.email;       // fallback cuối cùng: dùng email làm key

  return id || null;
};

/* ============================================================
   🔧 helper – CREATE CART IF NOT EXISTS
============================================================ */
const ensureCart = async (userId) => {
  if (!userId) {
    throw new Error("userId is required for ensureCart");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

/* ============================================================
   GET /cart
============================================================ */
router.get(
  "/",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const userId = getUserIdFromReq(req);

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Cannot resolve user id from token" });
      }

      const cart = await ensureCart(userId);
      res.json(cart);
    } catch (err) {
      console.error("GET CART ERROR:", err);
      res.status(500).json({ message: "Failed to load cart" });
    }
  }
);

/* ============================================================
   POST /cart/add
============================================================ */
router.post(
  "/add",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const userId = getUserIdFromReq(req);

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Cannot resolve user id from token" });
      }

      const item = req.body;

      // Validate input
      if (!item.menuId || !item.name || typeof item.price !== "number") {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const cart = await ensureCart(userId);

      const exist = cart.items.find((i) => i.menuId === item.menuId);

      if (exist) {
        exist.quantity += 1;
        exist.subtotal = exist.quantity * exist.price;
      } else {
        cart.items.push({
          menuId: item.menuId,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl || "",
          restaurantId: item.restaurantId || "",
          restaurantName: item.restaurantName || "",
          subtotal: item.price,
        });
      }

      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      res.status(500).json({ message: "Failed to add item" });
    }
  }
);

/* ============================================================
   DELETE /cart/remove/:menuId
============================================================ */
router.delete(
  "/remove/:menuId",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const userId = getUserIdFromReq(req);

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Cannot resolve user id from token" });
      }

      const { menuId } = req.params;

      if (!menuId) {
        return res.status(400).json({ message: "menuId is required" });
      }

      const cart = await ensureCart(userId);

      const item = cart.items.find((i) => i.menuId === menuId);

      if (!item) {
        return res.json(cart);
      }

      if (item.quantity === 1) {
        cart.items = cart.items.filter((i) => i.menuId !== menuId);
      } else {
        item.quantity -= 1;
        item.subtotal = item.quantity * item.price;
      }

      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error("REMOVE ITEM ERROR:", err);
      res.status(500).json({ message: "Failed to remove item" });
    }
  }
);

/* ============================================================
   DELETE /cart/clear
============================================================ */
router.delete(
  "/clear",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const userId = getUserIdFromReq(req);

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Cannot resolve user id from token" });
      }

      await Cart.findOneAndUpdate(
        { userId },
        { items: [] },
        { new: true }
      );

      res.json({ message: "Cart cleared" });
    } catch (err) {
      console.error("CLEAR CART ERROR:", err);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  }
);

module.exports = router;
