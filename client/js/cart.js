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
  // Check if user is registered/logged in
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    alert('⚠️ You must register an account first to add items to cart and place an order!');
    if (typeof showToast === 'function') {
      showToast('⚠️ Please register or login first to make an order!');
    }
    window.location.href = '/pages/signup.html';
    return;
  }

  let cart = getCart();
  const existingIdx = cart.findIndex(item => String(item.productId) === String(product._id || product.id));

  const availableStock = product.stock !== undefined ? product.stock : 999;
  const currentInCart = existingIdx !== -1 ? cart[existingIdx].quantity : 0;

  if (currentInCart + quantity > availableStock) {
    const msg = `⚠️ Product "${product.name}" is only ${availableStock} available!`;
    if (typeof showToast === 'function') {
      showToast(msg);
    } else {
      alert(msg);
    }
    return;
  }

  const originalPrice = parseFloat(product.price);
  const discountPercent = product.discount ? parseFloat(product.discount) : 0;
  const discountAmount = discountPercent > 0 ? parseFloat((originalPrice * discountPercent / 100).toFixed(2)) : 0;
  const effectivePrice = parseFloat((originalPrice - discountAmount).toFixed(2));
  const fallbackImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';

  if (existingIdx !== -1) {
    cart[existingIdx].quantity += quantity;
    cart[existingIdx].originalPrice = originalPrice;
    cart[existingIdx].discount = discountPercent;
    cart[existingIdx].discountAmount = discountAmount;
    cart[existingIdx].price = effectivePrice;
    if (product.image) cart[existingIdx].image = product.image;
    if (product.stock !== undefined) cart[existingIdx].stock = product.stock;
  } else {
    cart.push({
      productId: product._id || product.id,
      name: product.name,
      originalPrice: originalPrice,
      discount: discountPercent,
      discountAmount: discountAmount,
      price: effectivePrice,
      image: product.image || fallbackImage,
      weight: product.weight || '500g',
      quantity: quantity,
      stock: product.stock !== undefined ? product.stock : 10
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
    if (item) {
      if (item.stock !== undefined && newQty > item.stock) {
        const msg = `⚠️ Product "${item.name}" is only ${item.stock} available!`;
        if (typeof showToast === 'function') {
          showToast(msg);
        } else {
          alert(msg);
        }
        return;
      }
      item.quantity = newQty;
    }
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

  const originalSubtotal = cart.reduce((sum, item) => {
    const orig = item.originalPrice !== undefined ? item.originalPrice : item.price;
    return sum + (orig * item.quantity);
  }, 0);

  const productDiscountTotal = cart.reduce((sum, item) => {
    const discAmt = item.discountAmount !== undefined ? item.discountAmount : 0;
    return sum + (discAmt * item.quantity);
  }, 0);

  const subtotal = Math.max(0, originalSubtotal - productDiscountTotal);
  const gst = subtotal * 0.05; // 5% GST
  const deliveryCharge = subtotal > 0 ? 40 : 0;
  let promoDiscount = 0;

  if (appliedCoupon) {
    promoDiscount = (subtotal * appliedCoupon.discountPercentage) / 100;
    if (appliedCoupon.maxDiscount && promoDiscount > appliedCoupon.maxDiscount) {
      promoDiscount = appliedCoupon.maxDiscount;
    }
  }

  const grandTotal = Math.max(0, subtotal + gst + deliveryCharge - promoDiscount);

  return { originalSubtotal, productDiscountTotal, subtotal, gst, deliveryCharge, discount: promoDiscount, grandTotal };
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

// Sync cart items with fresh server product prices & stock
async function syncCartWithLatestPrices() {
  let cart = getCart();
  if (cart.length === 0) return cart;

  try {
    const res = await fetch('/api/products?isEnabled=true');
    const data = await res.json();

    if (data.success && data.products) {
      let changed = false;
      let priceChangedNotice = [];

      cart.forEach(item => {
        const freshProd = data.products.find(p => String(p._id) === String(item.productId));
        if (freshProd) {
          const origPrice = parseFloat(freshProd.price);
          const discPercent = freshProd.discount ? parseFloat(freshProd.discount) : 0;
          const discAmt = discPercent > 0 ? parseFloat((origPrice * discPercent / 100).toFixed(2)) : 0;
          const effectivePrice = parseFloat((origPrice - discAmt).toFixed(2));

          if (item.price !== effectivePrice || item.discount !== discPercent) {
            priceChangedNotice.push(`"${item.name}": ₹${item.price} ➔ ₹${effectivePrice} (${discPercent}% OFF)`);
            item.originalPrice = origPrice;
            item.discount = discPercent;
            item.discountAmount = discAmt;
            item.price = effectivePrice;
            changed = true;
          }
          if (freshProd.stock !== undefined && item.stock !== freshProd.stock) {
            item.stock = freshProd.stock;
            changed = true;
          }
          if (freshProd.name) item.name = freshProd.name;
          if (freshProd.image) item.image = freshProd.image;
        }
      });

      if (changed) {
        saveCart(cart);
        if (priceChangedNotice.length > 0 && typeof showToast === 'function') {
          showToast(`🏷️ Cart item price(s) updated: ${priceChangedNotice.join(', ')}`);
        }
      }
    }
  } catch (err) {
    console.error('Error syncing cart prices:', err);
  }

  return getCart();
}

window.syncCartWithLatestPrices = syncCartWithLatestPrices;

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
