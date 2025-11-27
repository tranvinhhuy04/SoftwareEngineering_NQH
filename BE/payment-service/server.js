// server.js (payment-service)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
require("./rabbitmq");

app.use(cors());
app.use(express.json());

// Mongo connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
const paymentRoutes = require("./routes/paymentVnpay");
app.use("/", paymentRoutes);

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`💳 Payment service running on port ${PORT}`);
});
