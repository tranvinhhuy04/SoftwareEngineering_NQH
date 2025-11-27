const mongoose = require("mongoose");   // 🔥 BẮT BUỘC PHẢI CÓ

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // 🔥 Dùng email thay vì id
    customerEmail: {
      type: String,
      required: true,
    },

    amount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["vnpay", "momo", "stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },

    transactionId: String,
    bankCode: String,
    vnpResponseCode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
