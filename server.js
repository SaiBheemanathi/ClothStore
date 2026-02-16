require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const path = require("path");


const app = express();
app.use(cors({
  origin: "http://localhost:59728"
}));

app.use(express.json());

// Serve frontend
app.use(express.static(__dirname));

// Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// API
app.post("/create-order", async (req, res) => {
  console.log("👉 /create-order started");

  try {
    console.log("👉 About to call Razorpay");

    const order = await razorpay.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });

    console.log("✅ Razorpay responded");
    console.log(order);

    return res.json(order);

  } catch (err) {
    console.log("❌ Razorpay FAILED");
    console.log(err);              // full error object
    console.log(err.message);      // readable message

    return res.status(500).json({
      error: err.message || "Razorpay order failed"
    });
  }
});


const crypto = require("crypto");

app.post("/payment-success", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("✅ Payment verified");
      return res.json({ success: true });
    } else {
      console.log("❌ Signature mismatch");
      return res.status(400).json({ success: false });
    }
  } catch (err) {
    console.error("🔥 payment-success error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(62882, () => {
  console.log("✅ Server running at http://localhost:62882");
});