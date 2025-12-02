const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  menuId: { type: String, required: true },     // string ONLY
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  imageUrl: String,

  restaurantId: { type: String },               // string ONLY
  restaurantName: { type: String },

  subtotal: Number,
});

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },   // string ONLY
    items: [CartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
