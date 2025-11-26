const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone_number: {
      type: String,
      required: false,
    },

    address: {
      type: String,
      required: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    // SQL: user_role_id BIGINT
    // Nhưng microservice thì nên dùng role string cho gọn
    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery", "admin"],
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("User", userSchema);
