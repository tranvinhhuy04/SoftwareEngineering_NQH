// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");

const Payment = require("../models/Payment");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

/* ======================================================
    🔹 GET ALL PAYMENTS (ADMIN)
====================================================== */
router.get("/", verifyToken, allowRoles("admin"), async (req, res) => {
  const data = await Payment.find().sort({ createdAt: -1 });
  res.json(data);
});

/* ======================================================
    🔹 GET PAYMENT BY ID
====================================================== */
router.get("/:id", verifyToken, async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment)
    return res.status(404).json({ message: "Payment not found" });

  res.json(payment);
});

/* ======================================================
    🔹 ADMIN UPDATE STATUS
====================================================== */
router.patch(
  "/:id/status",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    const { paymentStatus } = req.body;

    const valid = ["pending", "processing", "paid", "failed"];
    if (!valid.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    res.json({ message: "Updated", payment });
  }
);

/* ======================================================
    🔹 DELETE PAYMENT
====================================================== */
router.delete("/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ message: "Payment deleted" });
});

/* ======================================================
    🔹 MOMO CREATE PAYMENT (DÙNG MOCK)
====================================================== */
router.post(
  "/momo/create",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { orderId, amount } = req.body;

      if (!orderId || !amount)
        return res
          .status(400)
          .json({ message: "orderId & amount required" });

      // ===== MoMo Sandbox Keys (Fake để mock) =====
      const partnerCode = "MOMOXXXX2025";
      const accessKey = "ACCESSKEY123456";
      const secretKey = "SECRETKEYMOCK123456";
      const returnUrl = "http://localhost:8000/payment/momo/return";
      const notifyUrl = "http://localhost:8000/payment/momo/webhook";

      // ===== Tạo payment record =====
      const payment = await Payment.create({
        orderId,
        customerEmail: req.user.email,
        amount,
        paymentMethod: "momo",
        paymentStatus: "processing",
      });

      const requestId = payment._id.toString();
      const orderInfo = `Thanh toán đơn hàng ${orderId}`;
      const extraData = "";

      // ===== Tạo RAW SIGNATURE =====
      const rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        notifyUrl +
        "&orderId=" +
        requestId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        returnUrl +
        "&requestId=" +
        requestId +
        "&requestType=captureWallet";

      // ===== Ký HMAC SHA256 =====
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      // ===== MoMo Payload =====
      const payload = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId: requestId,
        orderInfo,
        redirectUrl: returnUrl,
        ipnUrl: notifyUrl,
        extraData,
        requestType: "captureWallet",
        signature,
      };

      // ===== MOCK MODE – KHÔNG GỌI MOMO API =====
      const mockPayUrl = `https://test-payment.momo.vn/pay?orderId=${requestId}&amount=${amount}`;

      return res.json({ payUrl: mockPayUrl });
    } catch (err) {
      console.error("MoMo create error:", err);
      return res
        .status(500)
        .json({ message: "Internal server error" });
    }
  }
);

/* ======================================================
    🔹 MOMO RETURN — LUÔN SUCCESS (MOCK)
====================================================== */
router.get("/momo/return", async (req, res) => {
  return res.json({
    success: true,
    paymentId: req.query.orderId || "MOCK",
    amount: req.query.amount || 0,
    message: "MoMo Payment Success (MOCK)",
    query: req.query,
  });
});

/* ======================================================
    🔹 MOMO WEBHOOK — MOCK 100% SUCCESS
====================================================== */
router.post("/momo/webhook", async (req, res) => {
  try {
    console.log("⚠️ MoMo MOCK WEBHOOK — ALWAYS SUCCESS");

    const { orderId } = req.body;

    const payment = await Payment.findById(orderId);

    if (!payment)
      return res.json({ resultCode: 1001, message: "Payment not found" });

    payment.paymentStatus = "paid";
    payment.transactionId = "MOMO_MOCK_" + Date.now();
    payment.bankCode = "MoMoWallet";
    payment.momoResultCode = "0";
    await payment.save();

    // ===== PUBLISH EVENT ĐẾN ORDER-SERVICE =====
    await publishEvent("payment.succeeded", {
      orderId: payment.orderId.toString(),
      amount: payment.amount,
      method: "momo",
    });

    return res.json({
      resultCode: 0,
      message: "Success (MOCK MODE)",
    });
  } catch (err) {
    console.error("MoMo webhook error:", err);
    return res.json({ resultCode: 9999, message: err.message });
  }
});

module.exports = router;
