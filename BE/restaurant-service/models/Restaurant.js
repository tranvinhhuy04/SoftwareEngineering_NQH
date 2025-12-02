const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  ownerId: String, // from Auth user ID
  isOpen: Boolean,
  avatar: String,
  address: String,
  phone_number: String,
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
