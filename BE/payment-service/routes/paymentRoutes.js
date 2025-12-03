// routes/paymentRoutes.js — BẢN CHUẨN VNPAY + RabbitMQ
const express = require("express");
const router = express.Router();
const qs = require("qs");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const { verifyToken, allowRoles } = require("../utils/authMiddleware");
const { publishEvent } = require("../rabbitmq");

/* ======================================================
    🧩 Sort object keys — required by VNPAY checksum
====================================================== */
function sortObj(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach((key) => (sorted[key] = obj[key]));
  return sorted;
}

/* ======================================================
    🧾 TẠO PAYMENT VNPay
====================================================== */
router.post("/test", (req, res) => {
    res.json({ message: "Test OK" });
});

router.post(
  "/vnpay/create",
  verifyToken,
  allowRoles("customer"),
  async (req, res) => {
    try {
      const { orderId, amount } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({
          message: "orderId & amount are required",
        });
      }

      const tmnCode = process.env.VNPAY_TMNCODE;
      const secretKey = process.env.VNPAY_HASHSECRET;
      const vnpUrl = process.env.VNPAY_URL;
      const returnUrl = process.env.VNPAY_RETURN_URL;

      // Tạo payment DB trước
      const payment = await Payment.create({
        orderId,
        customerEmail: req.user.email,
        amount,
        paymentMethod: "vnpay",
        paymentStatus: "processing",
      });

      const txnRef = payment._id.toString(); // dùng làm mã giao dịch
      const now = new Date();
      const createDate = now.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

      const ipAddr = req.ip || "127.0.0.1";

      let params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: amount * 100,
        vnp_CurrCode: "VND",
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: "Thanh toan don hang " + orderId,
        vnp_OrderType: "billpayment",
        vnp_Locale: "vn",
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      params = sortObj(params);
      const signData = qs.stringify(params, { encode: false });

      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      params.vnp_SecureHash = signed;

      const payUrl = `${vnpUrl}?${qs.stringify(params, { encode: false })}`;

      res.json({ payUrl });
    } catch (err) {
      console.error("VNPay create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/* ======================================================
    🌐 FE REDIRECT RETURN URL — Chỉ dùng để hiển thị
====================================================== */
router.get("/vnpay/return", async (req, res) => {
  const code = req.query.vnp_ResponseCode;

  if (code === "00") {
    return res.json({
      message: "Payment success (waiting IPN verification)",
      query: req.query,
    });
  }

  res.json({ message: "Payment failed", query: req.query });
});

/* ======================================================
    🔥 VNPay IPN (Webhook) — Xác nhận giao dịch thật
====================================================== */
router.get("/vnpay/webhook", async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const receivedHash = vnp_Params["vnp_SecureHash"];

    // Remove hash fields
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObj(vnp_Params);

    const secretKey = process.env.VNPAY_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });

    const signedCheck = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // Sai checksum → từ chối
    if (signedCheck !== receivedHash) {
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }

    // Lấy thông tin thanh toán
    const paymentId = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];
    const bankCode = vnp_Params["vnp_BankCode"];
    const transactionId = vnp_Params["vnp_TransactionNo"];

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.json({ RspCode: "01", Message: "Payment not found" });
    }

    // Cập nhật trạng thái thanh toán
    const status = rspCode === "00" ? "paid" : "failed";

    const updated = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: status,
        bankCode,
        transactionId,
        vnpResponseCode: rspCode,
      },
      { new: true }
    );

    // Publish event nếu thành công
    if (rspCode === "00") {
      await publishEvent("payment.succeeded", {
        orderId: updated.orderId.toString(),
        amount: updated.amount,
        method: "vnpay",
        transactionId,
      });
    }

    res.json({ RspCode: "00", Message: "Success" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.json({ RspCode: "99", Message: err.message });
  }
});

module.exports = router;
