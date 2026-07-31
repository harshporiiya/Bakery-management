const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  weight: { type: String, default: '500g' },
  stock: { type: Number, default: 10 },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 12 },
  isEnabled: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
