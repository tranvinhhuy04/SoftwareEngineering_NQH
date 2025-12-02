const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,    // đổi ObjectId → String
      required: true,
    },

    menuId: {
      type: String,    // đổi ObjectId → String
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    price_per_unit: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
