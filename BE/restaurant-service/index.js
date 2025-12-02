const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Enable file upload (✔ Only once)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Restaurant DB connected"))
  .catch((err) => console.error("Mongo Error:", err));

// Route Files
const restaurantRoutes = require("./routes/restaurant");
const categoryRoutes = require("./routes/category");
const menuRoutes = require("./routes/menu");

// Mount Routes
app.use("/restaurant", restaurantRoutes);
app.use("/restaurant", categoryRoutes);
app.use("/restaurant", menuRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Restaurant Service is running" });
});

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Restaurant Service running on port ${process.env.PORT}`);
});
