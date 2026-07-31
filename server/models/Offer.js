const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  discountPercentage: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 500 },
  type: { type: String, enum: ['Coupon', 'Festival', 'Birthday', 'BOGO', 'Combo', 'Flash Sale'], default: 'Coupon' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);
