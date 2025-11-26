const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// import utility JWT đúng theo project của bạn
const { generateToken, verifyToken, allowRoles } = require("../utils/jwt");

const router = express.Router();

/**
 * ================================================================
 * 🧩 REGISTER
 * ================================================================
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone_number, address, avatar } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "name, email, password, role are required" });
    }

    const existed = await User.findOne({ email });
    if (existed) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role,
      phone_number: phone_number || null,
      address: address || null,
      avatar: avatar || null,
      is_active: true,
      verified: false,
    });

    return res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================================================
 * 🔑 LOGIN
 * ================================================================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      token,
      role: user.role,
      userId: user._id,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================================================
 * 👤 CURRENT USER PROFILE
 * ================================================================
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select(
      "_id name email role phone_number address avatar verified is_active created_at"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);

  } catch (err) {
    console.error("Fetch me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


/**
 * ================================================================
 * 👑 GET ALL USERS (admin only)
 * ================================================================
 */
router.get("/users", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select(
      "_id name email role phone_number address avatar is_active"
    );
    return res.json(users);

  } catch (err) {
    console.error("Failed to fetch users:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * ================================================================
 * 🔥 BULK USER LOOKUP (admin)
 * ================================================================
 */
router.post("/admin/users/bulk-info",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ error: "ids array required" });

      const users = await User.find(
        { _id: { $in: ids } },
        "_id name email role"
      );

      return res.json(users);

    } catch (err) {
      console.error("Bulk lookup error:", err);
      return res.status(500).json({ error: "Bulk user lookup failed" });
    }
  }
);

module.exports = router;
