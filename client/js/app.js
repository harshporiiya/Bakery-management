// Main Storefront Application Controller

let allProducts = [];
let activeCategory = 'All';

async function loadProductsList() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  try {
    const searchVal = document.getElementById('search-input')?.value || '';
    const sortVal = document.getElementById('sort-select')?.value || 'newest';
    const ratingVal = document.getElementById('rating-select')?.value || '';

    let url = `/api/products?isEnabled=true`;
    if (activeCategory !== 'All') url += `&category=${encodeURIComponent(activeCategory)}`;
    if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;
    if (sortVal) url += `&sort=${sortVal}`;
    if (ratingVal) url += `&minRating=${ratingVal}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      allProducts = data.products;
      renderProductsGrid(allProducts);
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

function renderProductsGrid(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
        <h3>🍰 No bakery items found matching your filters.</h3>
        <p>Try searching for cakes, cookies, or donuts!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => {
    const isOut = product.stock <= 0;
    const isLow = product.stock > 0 && product.stock <= 5;
    const discountedPrice = product.discount > 0 ? (product.price - (product.price * product.discount / 100)).toFixed(0) : product.price;

    return `
      <div class="product-card glass-panel">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'">
          ${product.discount > 0 ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
          <button class="product-favorite-btn" onclick="toggleFavorite('${product._id}')" title="Favorite">❤️</button>
        </div>
        <div class="product-info">
          <div class="product-category-weight">
            <span>${product.category}</span>
            <span>⚖️ ${product.weight || '500g'}</span>
          </div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          
          <div class="product-rating-stock">
            <span class="rating-stars">⭐ ${product.rating || '4.8'} (${product.reviewsCount || 12})</span>
            ${isOut ? `<span class="stock-out">Out of Stock</span>` : `<span class="stock-tag ${isLow ? 'low' : ''}">${product.stock} in stock</span>`}
          </div>

          <div class="product-bottom">
            <div class="price-box">
              <span class="current-price">₹${discountedPrice}</span>
              ${product.discount > 0 ? `<span class="original-price">₹${product.price}</span>` : ''}
            </div>
            <div class="card-actions">
              <button onclick="openProductModal('${product._id}')" class="btn btn-outline btn-sm">View</button>
              <button onclick="handleAddToCart('${product._id}')" class="btn btn-gold btn-sm" ${isOut ? 'disabled' : ''}>
                🛒 Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleAddToCart(productId) {
  const prod = allProducts.find(p => String(p._id) === String(productId));
  if (prod) {
    addToCart(prod, 1);
  }
}

function selectCategory(categoryName, element) {
  activeCategory = categoryName;
  document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');
  loadProductsList();
}

function toggleFavorite(productId) {
  let favorites = JSON.parse(localStorage.getItem('bakery_favorites') || '[]');
  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId);
    showToast('Removed from favorites ❤️');
  } else {
    favorites.push(productId);
    showToast('Added to Wishlist! ❤️');
  }
  localStorage.setItem('bakery_favorites', JSON.stringify(favorites));
}

// Quick View Product Modal
function openProductModal(productId) {
  const prod = allProducts.find(p => String(p._id) === String(productId));
  if (!prod) return;

  const modal = document.getElementById('product-details-modal');
  const modalContent = document.getElementById('modal-details-content');
  if (!modal || !modalContent) return;

  const discountedPrice = prod.discount > 0 ? (prod.price - (prod.price * prod.discount / 100)).toFixed(0) : prod.price;

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
      <img src="${prod.image}" style="width: 100%; border-radius: var(--radius-md); object-fit: cover; max-height: 300px;">
      <div>
        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--gold-accent); font-weight: 700;">${prod.category}</span>
        <h2 style="margin: 8px 0;">${prod.name}</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">${prod.description}</p>
        <p><strong>Weight:</strong> ${prod.weight}</p>
        <p style="margin: 8px 0;"><strong>Available Stock:</strong> ${prod.stock} items</p>
        <p><strong>Rating:</strong> ⭐ ${prod.rating} / 5</p>
        <div style="margin: 20px 0;">
          <span style="font-size: 1.8rem; font-weight: 800; color: var(--gold-accent);">₹${discountedPrice}</span>
          ${prod.discount > 0 ? `<span style="text-decoration: line-through; color: var(--text-light); margin-left: 10px;">₹${prod.price}</span>` : ''}
        </div>
        <button onclick="handleAddToCart('${prod._id}'); closeModal();" class="btn btn-gold" style="width: 100%;">🛒 Add to Cart Now</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

// Fetch Active Offers Banner
async function loadOffersList() {
  const container = document.getElementById('offers-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/offers');
    const data = await res.json();
    if (data.success && data.offers.length > 0) {
      container.innerHTML = data.offers.map(offer => `
        <div class="offer-card glass-panel">
          <span class="offer-code-chip">${offer.code}</span>
          <h3 style="font-size: 1.2rem; margin-bottom: 6px;">${offer.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">${offer.description}</p>
          <span style="font-size: 0.9rem; font-weight: 700; color: var(--warm-accent);">Save up to ${offer.discountPercentage}% Off</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading offers:', err);
  }
}

// Global window mappings for real-time socket updates
window.loadProductsList = loadProductsList;

document.addEventListener('DOMContentLoaded', () => {
  loadProductsList();
  loadOffersList();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      loadProductsList();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => loadProductsList());
  }

  const ratingSelect = document.getElementById('rating-select');
  if (ratingSelect) {
    ratingSelect.addEventListener('change', () => loadProductsList());
  }
});
