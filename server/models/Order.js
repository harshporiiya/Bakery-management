const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  weight: { type: String, default: '500g' }
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  time: { type: Date, default: Date.now },
  note: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  gst: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Credit Card', 'Debit Card', 'Net Banking'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Baking', 'Packed', 'Out for Delivery', 'Delivered', 'Rejected'], 
    default: 'Pending' 
  },
  shippingAddress: {
    street: String,
    city: String,
    zip: String
  },
  trackingTimeline: [timelineSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
