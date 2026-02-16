// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ===== SAVE CART =====
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// ===== ADD TO CART =====
function addToCart(name, price) {
  console.log("Add to cart clicked:", name);

  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  saveCart();
  alert("Added to cart");
}

// ===== CART COUNT =====
function updateCartCount() {
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;
  countEl.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

// ===== CART PAGE =====
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");

  if (!cartItems || !totalPriceEl) return;

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <strong>${item.name}</strong>
        ₹${item.price} x ${item.qty}
        <button onclick="changeQty(${index},1)">+</button>
        <button onclick="changeQty(${index},-1)">−</button>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalPriceEl.innerText = total;
}

// ===== CHANGE QTY =====
function changeQty(index, change) {
  cart[index].qty += change;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
}

// ===== REMOVE ITEM =====
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// ===== CHECKOUT PAGE =====
function loadCheckout() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const summary = document.getElementById("orderSummary");
  const totalEl = document.getElementById("totalAmount");
  const advanceEl = document.getElementById("advanceAmount");

  // ---- attach submit FIRST (CRITICAL) ----
  form.onsubmit = function (e) {
    e.preventDefault();
    console.log("✅ Pay Advance clicked");

    const advance = Number(document.getElementById("advanceAmount").innerText);

    fetch("http://localhost:62882/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: advance })
    })
    .then(res => res.json())
    .then(data => openRazorpay(data))
    .catch(err => console.error("Backend error:", err));
    };


  // ---- below is ONLY for displaying amounts ----
  if (!summary || !totalEl || !advanceEl) return;

  let total = 0;
  summary.innerHTML = "";

  cart.forEach(item => {
    total += item.price * item.qty;
    summary.innerHTML += `<p>${item.name} x ${item.qty}</p>`;
  });

  const advance = Math.round(total * 0.2);
  totalEl.innerText = total;
  advanceEl.innerText = advance;
}

function openRazorpay(orderData) {
  const options = {
    key: "rzp_test_SGiUDdjQyr6Ifu", // test key
    amount: orderData.amount,
    currency: "INR",
    name: "Sai Cloth Store",
    description: "Advance Payment",
    order_id: orderData.razorpayOrderId,
    handler: async function (response) {
        alert("Advance payment successful!");

        await fetch("http://localhost:62882/payment-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderType: "ADVANCE"
            })
        });
    }

  };

  const rzp = new Razorpay(options);
  rzp.open();
}


// ===== INIT =====
updateCartCount();
renderCart();
loadCheckout();