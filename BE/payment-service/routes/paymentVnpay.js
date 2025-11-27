// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const qs = require("qs");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

// Sort keys for checksum
function sortObj(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((key) => (sorted[key] = obj[key]));
  return sorted;
}

/* ======================================================
    🔹 CRUD PAYMENT
====================================================== */

// GET ALL payments (admin)
router.get("/", verifyToken, allowRoles("admin"), async (req, res) => {
  const data = await Payment.find().sort({ createdAt: -1 });
  res.json(data);
});

// GET payment by id
router.get("/:id", verifyToken, async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  res.json(payment);
});

// UPDATE payment status
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

// DELETE payment
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
  }
);
/* ======================================================
    VNPay - Create Payment Link
====================================================== */
router.post(
  "/vnpay/create",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { orderId, amount } = req.body;
      if (!orderId || !amount) {
        return res.status(400).json({ message: "orderId & amount are required" });
      }

      const tmnCode = process.env.VNPAY_TMNCODE;
      const secretKey = process.env.VNPAY_HASHSECRET;
      const vnpUrl = process.env.VNPAY_URL;
      const returnUrl = process.env.VNPAY_RETURN_URL;

      // Create payment record (status=processing)
      const payment = await Payment.create({
        orderId,
        customerEmail: req.user.email,   // 🔥 LƯU EMAIL
        amount,
        paymentMethod: "vnpay",
        paymentStatus: "processing",
      });

      // Build params
      let date = new Date();
      let createDate = date.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

      let ip = req.ip || "127.0.0.1";
      let txnRef = payment._id.toString(); // UNIQUE reference

      let params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: amount * 100,
        vnp_CurrCode: "VND",
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: "Pay order " + orderId,
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ip,
        vnp_CreateDate: createDate,
      };

      params = sortObj(params);
      let signData = qs.stringify(params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      params["vnp_SecureHash"] = signed;
      let payUrl = vnpUrl + "?" + qs.stringify(params, { encode: false });

      res.json({ payUrl });
    } catch (err) {
      console.error("VNPay create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/* ======================================================
    🔹 VNPay Return URL (FE redirect)
====================================================== */
router.get("/vnpay/return", async (req, res) => {
  const code = req.query.vnp_ResponseCode;
  if (code === "00") {
    res.json({ message: "Payment success", query: req.query });
  } else {
    res.json({ message: "Payment failed", query: req.query });
  }
});

/* ======================================================
    🔹 VNPay Webhook / IPN — Xác nhận thật
====================================================== */
router.get("/vnpay/webhook", async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = process.env.VNPAY_HASHSECRET;
    vnp_Params = sortObj(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });

    let signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // ❌ WRONG SIGNATURE
    if (secureHash !== signed) {
      return res.status(400).json({ RspCode: "97", Message: "Invalid signature" });
    }

    // Get info
    const paymentId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transactionId = vnp_Params["vnp_TransactionNo"];
    const bankCode = vnp_Params["vnp_BankCode"];

    // Update DB
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: responseCode === "00" ? "paid" : "failed",
        transactionId,
        bankCode,
        vnpResponseCode: responseCode,
      },
      { new: true }
    );

    // Publish event to Order Service
    if (payment && responseCode === "00") {
      await publishEvent("payment.succeeded", {
        orderId: payment.orderId.toString(),
        amount: payment.amount,
        method: "vnpay",
      });
    }

    res.json({ RspCode: "00", Message: "Success" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.json({ RspCode: "99", Message: err.message });
  }
});

module.exports = router;
