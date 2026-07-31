const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const offerRoutes = require('./routes/offerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);

// Fallback to client pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/signup.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/cart.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/profile.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/pages/dashboard.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = app;
