const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    totalAmount: { type: Number, required: true },

    orderStatus: {
      type: String,
      enum: ["pending", "accepted", "in-transit", "delivered"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderDate: { type: Date, default: Date.now },

    deliveryMethod: {
      type: String,
      enum: ["delivery", "drone"],
      default: "delivery",
    },

    deliveryLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    restaurantLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    deliveryPersonEmail: { type: String },

    paymentIntentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
