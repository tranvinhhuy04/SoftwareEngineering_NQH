// routes/adminDrone.js
const express = require("express");
const router = express.Router();
const Drone = require("../models/Drone");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");

// GET ALL drones + filter
router.get("/", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const { status, isActive } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const drones = await Drone.find(filter).sort({ createdAt: -1 });
    res.json(drones);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drones" });
  }
});

// GET 1 drone
router.get("/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ message: "Drone not found" });

    res.json(drone);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drone" });
  }
});

// CREATE drone
router.post("/", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const {
      code,
      name,
      capacityKg,
      isActive,
      baseLocation,
    } = req.body;

    const drone = await Drone.create({
      code,
      name,
      capacityKg,
      isActive,
      baseLocation,
      // Các field tự động set default theo schema
    });

    res.status(201).json(drone);
  } catch (err) {
    res.status(500).json({ message: "Failed to create drone" });
  }
});

// UPDATE drone
router.put("/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const update = req.body; // phải chứa baseLocation, name, capacityKg, isActive...

    const drone = await Drone.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!drone) return res.status(404).json({ message: "Drone not found" });

    res.json(drone);
  } catch (err) {
    res.status(500).json({ message: "Failed to update drone" });
  }
});

// SOFT DELETE drone
router.delete("/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const drone = await Drone.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!drone) return res.status(404).json({ message: "Drone not found" });

    res.json({ message: "Drone disabled", drone });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete drone" });
  }
});

module.exports = router;
