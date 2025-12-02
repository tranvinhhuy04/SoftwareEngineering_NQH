const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
require("./rabbitmq");

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Debug log
app.use((req, res, next) => {
  console.log(
    `[Incoming] ${req.method} ${req.path} authHeader=${!!req.headers.authorization}`
  );
  next();
});

// Routes
const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/admin");
const cartRoutes = require("./routes/cart");

// 🔥 Sửa lại prefix CHUẨN cho order-service
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/cart", cartRoutes);

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Order DB connected"))
  .catch((err) => console.error("Order DB error:", err.message));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () =>
  console.log(`Order Service running on port ${PORT}`)
);
