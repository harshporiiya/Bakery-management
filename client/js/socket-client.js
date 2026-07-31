// Socket.IO Client Real-Time Connection
let socket;

function initSocketConnection() {
  if (typeof io === 'undefined') return;

  socket = io();

  socket.on('connect', () => {
    console.log('⚡ Socket connected to Bakery Server:', socket.id);
    
    // Check logged in user and join room
    const user = JSON.parse(localStorage.getItem('bakery_user') || 'null');
    if (user) {
      if (user.role === 'admin') {
        socket.emit('join_admin');
      } else {
        socket.emit('join_user', user.id);
      }
    }
  });

  // Real-Time Product Price / Stock / Details Updated by Owner
  socket.on('product_updated', (data) => {
    console.log('🔄 Real-Time Product Updated:', data);
    showToast(`✨ Price/Stock updated for "${data.product.name}"`);
    if (window.loadProductsList) {
      window.loadProductsList();
    }
  });

  // Real-Time New Product Added by Owner
  socket.on('product_added', (data) => {
    console.log('➕ Real-Time Product Added:', data);
    showToast(`🍰 New item added: "${data.product.name}"!`);
    if (window.loadProductsList) {
      window.loadProductsList();
    }
  });

  // Real-Time Product Deleted by Owner
  socket.on('product_deleted', (data) => {
    console.log('🗑️ Real-Time Product Deleted:', data);
    if (window.loadProductsList) {
      window.loadProductsList();
    }
  });

  // Real-Time Order Status Timeline updated by Owner
  socket.on('order_status_change', (data) => {
    console.log('📦 Real-Time Order Status Update:', data);
    showToast(`🔔 Order #${data.orderNumber} status changed to: ${data.status}`);
    if (window.loadMyOrdersList) {
      window.loadMyOrdersList();
    }
  });

  // Admin New Order Notification
  socket.on('new_order_admin', (data) => {
    console.log('💰 Real-Time New Order Received:', data);
    showToast(`🚨 New Order! #${data.order.orderNumber} (₹${data.order.grandTotal})`);
    if (window.loadAdminDashboard) {
      window.loadAdminDashboard();
    }
  });

  // Offer Started Notification
  socket.on('offer_created', (data) => {
    showToast(`🎉 Festive Promo: ${data.offer.title} (${data.offer.code})`);
  });

  // Generic Notification Toast
  socket.on('notification', (data) => {
    showToast(`📢 ${data.title}: ${data.message}`);
  });
}

function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  initSocketConnection();
});
