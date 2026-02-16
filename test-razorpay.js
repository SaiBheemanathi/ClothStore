// test-razorpay.js
require("dotenv").config();

console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

const Razorpay = require("razorpay");

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

(async () => {
  try {
    const order = await rzp.orders.create({
      amount: 50000,
      currency: "INR"
    });
    console.log("✅ SUCCESS:", order.id);
  } catch (e) {
    console.error("❌ FAIL:", e.message);
  }
})();
