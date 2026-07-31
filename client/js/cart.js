// Cart Management & Checkout Engine

let appliedCoupon = null;

function getCart() {
  return JSON.parse(localStorage.getItem('bakery_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('bakery_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantity = 1) {
  let cart = getCart();
  const existingIdx = cart.findIndex(item => String(item.productId) === String(product._id || product.id));

  if (existingIdx !== -1) {
    cart[existingIdx].quantity += quantity;
  } else {
    cart.push({
      productId: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight || '500g',
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`🛒 "${product.name}" added to cart!`);
}

function updateCartQuantity(productId, newQty) {
  let cart = getCart();
  if (newQty <= 0) {
    cart = cart.filter(item => String(item.productId) !== String(productId));
  } else {
    const item = cart.find(item => String(item.productId) === String(productId));
    if (item) item.quantity = newQty;
  }
  saveCart(cart);
  if (window.renderCartPage) window.renderCartPage();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => String(item.productId) !== String(productId));
  saveCart(cart);
  if (window.renderCartPage) window.renderCartPage();
}

function clearCart() {
  localStorage.removeItem('bakery_cart');
  appliedCoupon = null;
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalCount;
}

function calculateCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.05; // 5% GST
  const deliveryCharge = subtotal > 0 ? 40 : 0;
  let discount = 0;

  if (appliedCoupon) {
    discount = (subtotal * appliedCoupon.discountPercentage) / 100;
    if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
      discount = appliedCoupon.maxDiscount;
    }
  }

  const grandTotal = Math.max(0, subtotal + gst + deliveryCharge - discount);

  return { subtotal, gst, deliveryCharge, discount, grandTotal };
}

// Apply Coupon Code
async function applyCouponCode(code) {
  if (!code) return;
  const { subtotal } = calculateCartTotals();

  try {
    const res = await fetch('/api/offers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal: subtotal })
    });
    const data = await res.json();
    if (data.success) {
      appliedCoupon = data.offer;
      showToast(data.message);
      if (window.renderCartPage) window.renderCartPage();
    } else {
      showToast('❌ ' + data.message);
    }
  } catch (err) {
    showToast('Failed to apply coupon.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
