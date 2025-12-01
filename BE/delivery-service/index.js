// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const { subscribeEvent } = require("./rabbitmq");
const axios = require("axios");

app.use(cors());
app.use(express.json());

// ROUTES
const deliveryRoutes = require("./routes/delivery");
app.use("/", deliveryRoutes);

// 🔥 ORDER-SERVICE BASE URL
const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://order-service:5003";

// --------------------------------------------------
// 🔔 LISTEN event "order.accepted"
// --------------------------------------------------
subscribeEvent(
  "delivery.accept.queue",
  ["order.accepted"],
  async (payload) => {
    console.log("📥 [Delivery] Received order.accepted:", payload);

    await axios.patch(
      `${ORDER_SERVICE_URL}/order/${payload.orderId}/status`,
      { status: "accepted" }
    );

    console.log("🟢 Order set to ACCEPTED:", payload.orderId);
  }
);

// --------------------------------------------------

app.listen(process.env.PORT, () => {
  console.log(`Delivery Service running on port ${process.env.PORT}`);
});
