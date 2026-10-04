// Auth & Theme Utility Helper

const API_BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('bakery_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('bakery_user');
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return !!getAuthToken();
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('bakery_token');
  localStorage.removeItem('bakery_user');
  window.location.href = '/pages/login.html';
}

// Dark/Light Mode Theme Switcher
function initTheme() {
  const savedTheme = localStorage.getItem('bakery_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('bakery_theme', nextTheme);
  updateThemeIcon(nextTheme);
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Render dynamic navbar state
function updateNavbar() {
  const user = getCurrentUser();
  const navActions = document.getElementById('nav-user-actions');
  const mobileNavUser = document.getElementById('mobile-nav-user-actions');

  const desktopContent = user ? `
    <a href="${user.role === 'admin' ? '/pages/dashboard.html' : '/pages/profile.html'}" class="btn btn-outline btn-sm">
      👤 ${user.name} (${user.role === 'admin' ? 'Owner' : 'Profile'})
    </a>
    <button onclick="logout()" class="btn btn-chocolate btn-sm">Logout</button>
  ` : `
    <a href="/pages/login.html" class="btn btn-outline btn-sm">Login</a>
    <a href="/pages/signup.html" class="btn btn-gold btn-sm">Sign Up</a>
  `;

  const mobileContent = user ? `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
      <a href="${user.role === 'admin' ? '/pages/dashboard.html' : '/pages/profile.html'}" class="btn btn-outline" style="width: 100%; justify-content: center; font-size: 0.92rem; padding: 12px 14px;">
        👤 ${user.name} (${user.role === 'admin' ? 'Owner Dashboard' : 'My Profile'})
      </a>
      <button onclick="logout()" class="btn btn-chocolate" style="width: 100%; justify-content: center; font-size: 0.92rem; padding: 12px 14px;">
        🚪 Logout
      </button>
    </div>
  ` : `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
      <a href="/pages/login.html" class="btn btn-outline" style="width: 100%; justify-content: center; font-size: 0.95rem; font-weight: 700; padding: 12px 14px;">
        🔑 Sign In / Login
      </a>
      <a href="/pages/signup.html" class="btn btn-gold" style="width: 100%; justify-content: center; font-size: 0.95rem; font-weight: 700; padding: 12px 14px;">
        ✨ Create Account (Sign Up)
      </a>
    </div>
  `;

  if (navActions) navActions.innerHTML = desktopContent;
  if (mobileNavUser) mobileNavUser.innerHTML = mobileContent;
}

// Mobile Hamburger Navigation Drawer Controller
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggleBtn || !navLinks) return;

  function toggleMenu(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const isOpen = navLinks.classList.toggle('nav-open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.innerHTML = isOpen ? '✕' : '☰';
  }

  toggleBtn.addEventListener('click', toggleMenu);

  // Close when clicking outside of the navbar and drawer
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('nav-open') && !navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
      navLinks.classList.remove('nav-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '☰';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNavbar();
  initMobileNav();
});

