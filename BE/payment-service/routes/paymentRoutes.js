// routes/paymentRoutes.js — STRIPE CHUẨN + RABBITMQ + SCHEMA ĐÚNG
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

// ==============================
// ⭐ GÁN KEY STRIPE TRỰC TIẾP
// ==============================
const stripe = new Stripe("sk_test_51S8Mu3L5S2BtEXK0Mtpi70zJFcLhIJXl7LwZe52ibq4J9K5U4mM1vaBz9M8T0dk2oPp3pyuBHrNpdlWmEP66abSc00aNmopKTv");

// ==============================
// ⭐ CREATE PAYMENT INTENT
// ==============================
router.post(
  "/stripe/create",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { orderId, amount } = req.body;

      if (!orderId || !amount)
        return res
          .status(400)
          .json({ message: "orderId & amount required" });

      // Tạo PaymentIntent tại Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId,
          customerEmail: req.user.email,
        },
      });

      // Lưu vào DB theo SCHEMA của bạn
      await Payment.create({
        orderId,
        customerEmail: req.user.email,
        amount,
        paymentMethod: "stripe",
        paymentStatus: "processing",
        transactionId: paymentIntent.id,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err) {
      console.error("Stripe create error:", err);
      res.status(500).json({ message: "Stripe create error" });
    }
  }
);

// ==============================
// ⭐ KIỂM TRA THANH TOÁN
// ==============================
router.get(
  "/stripe/verify/:paymentIntentId",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      // Cập nhật theo Stripe status
      const statusMap = {
        succeeded: "paid",
        processing: "processing",
        requires_payment_method: "failed",
        requires_action: "processing",
        canceled: "failed",
      };

      const dbStatus = statusMap[paymentIntent.status] || "failed";

      await Payment.findOneAndUpdate(
        { transactionId: paymentIntentId },
        { paymentStatus: dbStatus },
        { new: true }
      );

      // Nếu thành công → publish event order-service
      if (paymentIntent.status === "succeeded") {
        const payment = await Payment.findOne({
          transactionId: paymentIntentId,
        });

        await publishEvent("payment.succeeded", {
          orderId: payment.orderId.toString(),
          amount: payment.amount,
          method: "stripe",
        });
      }

      res.json({ stripeStatus: paymentIntent.status });
    } catch (err) {
      console.error("Stripe verify error:", err);
      res.status(500).json({ message: "Stripe verify error" });
    }
  }
);

module.exports = router;
