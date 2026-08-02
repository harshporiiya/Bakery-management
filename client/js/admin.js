// Admin Dashboard Controller

let adminProducts = [];
let adminOrders = [];
let adminOffers = [];

async function loadAdminDashboard() {
  if (!isAdmin()) {
    showToast('⚠️ Admin access required.');
    window.location.href = '/pages/login.html';
    return;
  }

  await loadMetrics();
  await loadAdminProducts();
  await loadAdminOrders();
  await loadAdminCategories();
  await loadAdminOffers();
  await loadAdminCustomers();
}

// Fetch Metric Cards & Render Charts
async function loadMetrics() {
  try {
    const token = getAuthToken();
    const res = await fetch('/api/admin/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      const m = data.metrics;
      document.getElementById('m-today-sales').textContent = `₹${m.todaySales.toLocaleString('en-IN')}`;
      document.getElementById('m-today-orders').textContent = m.todayOrders;
      document.getElementById('m-pending-orders').textContent = m.pendingOrders;
      document.getElementById('m-customers').textContent = m.customers;
      document.getElementById('m-products').textContent = m.products;
      document.getElementById('m-revenue').textContent = `₹${m.totalRevenue.toLocaleString('en-IN')}`;
      document.getElementById('m-bestseller').textContent = m.bestSeller;
      document.getElementById('m-monthly').textContent = `₹${m.monthlyIncome.toLocaleString('en-IN')}`;

      renderSalesChart(data.charts);
    }
  } catch (err) {
    console.error('Metrics loading error:', err);
  }
}

// Render SVG Sales & Revenue Chart
function renderSalesChart(charts) {
  const container = document.getElementById('sales-chart-container');
  if (!container || !charts) return;

  const maxVal = Math.max(...charts.sales, 100);
  const width = 500;
  const height = 180;
  const points = charts.sales.map((val, idx) => {
    const x = (idx / (charts.sales.length - 1)) * (width - 40) + 20;
    const y = height - ((val / (maxVal || 1)) * (height - 40)) - 20;
    return `${x},${y}`;
  }).join(' ');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 180px; overflow: visible;">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <polyline fill="url(#chartGradient)" stroke="none" points="20,${height} ${points} ${width - 20},${height}" />
      <polyline fill="none" stroke="#D4AF37" stroke-width="3" points="${points}" />
      ${charts.sales.map((val, idx) => {
    const x = (idx / (charts.sales.length - 1)) * (width - 40) + 20;
    const y = height - ((val / (maxVal || 1)) * (height - 40)) - 20;
    return `
          <circle cx="${x}" cy="${y}" r="5" fill="#3D2314" stroke="#D4AF37" stroke-width="2" />
          <text x="${x}" y="${y - 10}" fill="var(--text-primary)" font-size="10" text-anchor="middle">₹${val}</text>
          <text x="${x}" y="${height + 15}" fill="var(--text-light)" font-size="10" text-anchor="middle">${charts.labels[idx]}</text>
        `;
  }).join('')}
    </svg>
  `;
}

// Product CRUD Handlers (Bakery Product Inventory Table - Only Delete button in Action column!)
async function loadAdminProducts() {
  const tableBody = document.getElementById('admin-products-table');
  if (!tableBody) return;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      adminProducts = data.products;
      tableBody.innerHTML = adminProducts.map(p => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.image}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
              <div>
                <strong>${p.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-light);">${p.category} | ${p.weight}</div>
              </div>
            </div>
          </td>
          <td>
            <input type="number" value="${p.price}" style="width: 80px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color);" onchange="quickUpdateProductPrice('${p._id}', this.value)">
          </td>
          <td>
            <input type="number" value="${p.stock}" style="width: 70px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color);" onchange="quickUpdateProductStock('${p._id}', this.value)">
          </td>
          <td>
            <input type="number" value="${p.discount || 0}" min="0" max="100" style="width: 65px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color);" onchange="quickUpdateProductDiscount('${p._id}', this.value)"> %
          </td>
          <td>
            <button onclick="toggleProductEnable('${p._id}', ${!p.isEnabled})" class="btn btn-sm ${p.isEnabled ? 'btn-outline' : 'btn-chocolate'}">
              ${p.isEnabled ? 'Active' : 'Disabled'}
            </button>
          </td>
          <td>
            <button onclick="deleteProduct('${p._id}')" class="btn btn-chocolate btn-sm">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error fetching admin products:', err);
  }
}

async function quickUpdateProductPrice(id, newPrice) {
  const token = getAuthToken();
  await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ price: newPrice })
  });
  showToast('Price updated live!');
}

async function quickUpdateProductDiscount(id, newDiscount) {
  const token = getAuthToken();
  await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ discount: newDiscount })
  });
  showToast(`Discount updated to ${newDiscount}% live!`);
}

async function quickUpdateProductStock(id, newStock) {
  const token = getAuthToken();
  await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ stock: newStock })
  });
  showToast('Stock updated live!');
}

async function handleSaveProductForm(e) {
  e.preventDefault();
  const token = getAuthToken();
  const form = document.getElementById('add-product-form');
  const formData = new FormData(form);

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      showToast('✅ Product created successfully!');
      closeModal();
      form.reset();
      loadAdminProducts();
    } else {
      showToast('❌ ' + data.message);
    }
  } catch (err) {
    showToast('Failed to save product.');
  }
}

async function toggleProductEnable(id, newStatus) {
  const token = getAuthToken();
  await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ isEnabled: newStatus })
  });
  loadAdminProducts();
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to remove this product?')) return;
  const token = getAuthToken();
  await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  showToast('Product deleted.');
  loadAdminProducts();
}

// Order Management Handlers
async function loadAdminOrders() {
  const tableBody = document.getElementById('admin-orders-table');
  if (!tableBody) return;

  try {
    const token = getAuthToken();
    const res = await fetch('/api/orders/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      adminOrders = data.orders;
      tableBody.innerHTML = adminOrders.map(o => `
        <tr>
          <td><strong>${o.orderNumber}</strong></td>
          <td>${o.customerName}<br><small style="color: var(--text-light);">${o.customerEmail}</small></td>
          <td>${(o.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
          <td><strong>₹${o.grandTotal}</strong><br><small>${o.paymentMethod}</small></td>
          <td>
            <select class="select-custom" style="padding: 4px 8px; font-size: 0.85rem;" onchange="updateOrderStatus('${o._id}', this.value)">
              ${['Pending', 'Preparing', 'Baking', 'Packed', 'Out for Delivery', 'Delivered', 'Rejected'].map(st => `
                <option value="${st}" ${o.orderStatus === st ? 'selected' : ''}>${st}</option>
              `).join('')}
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <a href="/api/orders/invoice/${o._id}?type=kot" target="_blank" class="btn btn-chocolate btn-sm" style="font-size: 0.75rem; padding: 4px 8px;">
                📜 KOT Slip
              </a>
              <a href="/api/orders/invoice/${o._id}" target="_blank" class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 4px 8px;">
                🧾 Final Bill
              </a>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error fetching admin orders:', err);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  const token = getAuthToken();
  try {
    const res = await fetch(`/api/orders/admin/status/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus, note: `Status updated to ${newStatus} by owner` })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order status updated to "${newStatus}"`);
      loadMetrics();
    }
  } catch (err) {
    showToast('Failed to update status.');
  }
}

// Categories Manager
async function loadAdminCategories() {
  const container = document.getElementById('admin-categories-list');
  if (!container) return;

  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      container.innerHTML = data.categories.map(c => `
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 50px; margin: 4px;">
          <span>${c.icon} ${c.name}</span>
          <button onclick="deleteCategory('${c._id}')" style="background:none; border:none; color: red; cursor:pointer;">&times;</button>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

async function handleAddCategory() {
  const name = prompt('Enter Category Name (e.g. Pastries):');
  const icon = prompt('Enter Category Emoji/Icon (e.g. 🍰):') || '🍰';
  if (!name) return;

  const token = getAuthToken();
  await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, icon })
  });
  showToast('Category added!');
  loadAdminCategories();
}

async function deleteCategory(id) {
  const token = getAuthToken();
  await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  loadAdminCategories();
}

// Offers & Promo Codes Management Handlers
async function loadAdminOffers() {
  const container = document.getElementById('admin-offers-table');
  if (!container) return;

  try {
    const token = getAuthToken();
    const res = await fetch('/api/offers/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      adminOffers = data.offers;
      container.innerHTML = adminOffers.map(o => `
        <tr>
          <td><span class="offer-code-chip" style="margin:0;">${o.code}</span></td>
          <td><strong>${o.title}</strong><br><small style="color: var(--text-light);">${o.description || ''}</small></td>
          <td><strong>${o.discountPercentage}% OFF</strong></td>
          <td>Min: ₹${o.minOrderAmount || 0} | Max: ₹${o.maxDiscount || 500}</td>
          <td>
            <button onclick="toggleOfferActive('${o._id}', ${!o.isActive})" class="btn btn-sm ${o.isActive ? 'btn-outline' : 'btn-chocolate'}">
              ${o.isActive ? 'Active' : 'Disabled'}
            </button>
          </td>
          <td>
            <button onclick="editOfferModal('${o._id}')" class="btn btn-gold btn-sm">Edit</button>
            <button onclick="deleteOffer('${o._id}')" class="btn btn-chocolate btn-sm">Remove</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading admin offers:', err);
  }
}

async function handleCreateOffer(e) {
  e.preventDefault();
  const token = getAuthToken();
  const form = document.getElementById('create-offer-form');
  const formData = new FormData(form);
  const bodyData = Object.fromEntries(formData.entries());

  const offerId = document.getElementById('edit-offer-id')?.value;

  try {
    let res;
    if (offerId) {
      res = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      });
    } else {
      res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      });
    }
    const data = await res.json();
    if (data.success) {
      showToast(`🎉 Offer "${data.offer.code}" saved successfully!`);
      closeModal();
      form.reset();
      if (document.getElementById('edit-offer-id')) document.getElementById('edit-offer-id').value = '';
      loadAdminOffers();
    }
  } catch (err) {
    showToast('Failed to save offer.');
  }
}

function editOfferModal(id) {
  const offer = adminOffers.find(o => String(o._id) === String(id));
  if (!offer) return;

  document.getElementById('edit-offer-id').value = offer._id;
  document.getElementById('offer-code').value = offer.code;
  document.getElementById('offer-title').value = offer.title;
  document.getElementById('offer-desc').value = offer.description || '';
  document.getElementById('offer-discount').value = offer.discountPercentage;
  document.getElementById('offer-minorder').value = offer.minOrderAmount || 0;
  document.getElementById('offer-maxdisc').value = offer.maxDiscount || 500;

  openCreateOfferModal();
}

async function toggleOfferActive(id, newStatus) {
  const token = getAuthToken();
  await fetch(`/api/offers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ isActive: newStatus })
  });
  loadAdminOffers();
}

async function deleteOffer(id) {
  if (!confirm('Are you sure you want to delete this promo offer?')) return;
  const token = getAuthToken();
  await fetch(`/api/offers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  showToast('Offer removed.');
  loadAdminOffers();
}

// Load Customers list
async function loadAdminCustomers() {
  const container = document.getElementById('admin-customers-table');
  if (!container) return;

  try {
    const token = getAuthToken();
    const res = await fetch('/api/admin/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      container.innerHTML = data.customers.map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.email}</td>
          <td>${c.phone || 'N/A'}</td>
          <td>🏆 ${c.rewardPoints || 50} pts</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading customers:', err);
  }
}

// Export for socket triggers
window.loadAdminDashboard = loadAdminDashboard;

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    loadAdminDashboard();
  }
});
