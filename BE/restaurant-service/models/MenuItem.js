const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: String,

  price: {
    type: Number,
    required: true,
    min: 0
  },

  image_url: {
    type: String,
    default: null
  },

  // Menu thuộc Category
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  // Menu thuộc Restaurant
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  }

}, { timestamps: true });

module.exports = mongoose.model("MenuItem", MenuItemSchema);
