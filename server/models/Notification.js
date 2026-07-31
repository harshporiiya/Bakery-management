const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, default: null }, // Null means broadcast to all/admins
  role: { type: String, enum: ['customer', 'admin', 'all'], default: 'all' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['New Order', 'Price Updated', 'Product Added', 'Offer Started', 'Stock Finished', 'Order Status'], default: 'New Order' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
