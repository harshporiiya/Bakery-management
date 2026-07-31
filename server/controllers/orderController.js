const Order = require('../models/Order');
const Product = require('../models/Product');
const { getDbStatus } = require('../config/db');
const { memoryStore } = require('../config/seedData');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

// Customer places order
exports.createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const customerEmail = req.user.email;
    const { customerName, customerPhone, items, subtotal, gst, deliveryCharge, discount, grandTotal, paymentMethod, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderNumber,
      customerId,
      customerName: customerName || 'Valued Customer',
      customerEmail,
      customerPhone: customerPhone || '',
      items,
      subtotal: parseFloat(subtotal),
      gst: parseFloat(gst),
      deliveryCharge: parseFloat(deliveryCharge),
      discount: discount ? parseFloat(discount) : 0,
      grandTotal: parseFloat(grandTotal),
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Completed',
      orderStatus: 'Pending',
      shippingAddress: shippingAddress || { street: '', city: '', zip: '' },
      trackingTimeline: [
        { status: 'Pending', time: new Date(), note: 'Order placed by customer.' }
      ],
      createdAt: new Date()
    };

    const isDbConnected = getDbStatus();
    let savedOrder;

    if (isDbConnected) {
      const order = new Order(orderData);
      savedOrder = await order.save();

      // Deduct stock for ordered items
      for (const item of items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
      }
    } else {
      savedOrder = { ...orderData, _id: 'ord_' + Date.now() };
      memoryStore.orders.unshift(savedOrder);

      // Deduct stock in memoryStore
      items.forEach(item => {
        const prod = memoryStore.products.find(p => String(p._id) === String(item.productId));
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });
    }

    // Real-Time Socket Notification to Owner / Admin
    const io = req.app.get('socketio');
    if (io) {
      io.to('admin_room').emit('new_order_admin', { order: savedOrder, message: `New Order Received! #${savedOrder.orderNumber} (₹${savedOrder.grandTotal})` });
      io.emit('notification', {
        title: 'New Order Received! 🍰',
        message: `${savedOrder.customerName} placed order #${savedOrder.orderNumber} for ₹${savedOrder.grandTotal}`,
        type: 'New Order'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Customer Orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    } else {
      const orders = memoryStore.orders
        .filter(o => String(o.customerId) === String(customerId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    } else {
      const orders = [...memoryStore.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Accept / Reject / Update Order Live Status Timeline
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Preparing', 'Baking', 'Packed', 'Out for Delivery', 'Delivered', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status state.' });
    }

    const isDbConnected = getDbStatus();
    let updatedOrder;

    if (isDbConnected) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      order.orderStatus = status;
      if (status === 'Delivered') order.paymentStatus = 'Completed';
      if (status === 'Rejected') order.paymentStatus = 'Failed';

      order.trackingTimeline.push({
        status,
        time: new Date(),
        note: note || `Order status updated to ${status}`
      });

      updatedOrder = await order.save();
    } else {
      const order = memoryStore.orders.find(o => String(o._id) === String(id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      order.orderStatus = status;
      if (status === 'Delivered') order.paymentStatus = 'Completed';
      if (status === 'Rejected') order.paymentStatus = 'Failed';

      order.trackingTimeline.push({
        status,
        time: new Date(),
        note: note || `Order status updated to ${status}`
      });

      updatedOrder = order;
    }

    // Target individual user room + broadcast to admin room
    const io = req.app.get('socketio');
    if (io) {
      const payload = {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        status: updatedOrder.orderStatus,
        timeline: updatedOrder.trackingTimeline,
        message: `Order #${updatedOrder.orderNumber} status updated to ${updatedOrder.orderStatus}`
      };

      io.to(`user_${updatedOrder.customerId}`).emit('order_status_change', payload);
      io.emit('order_status_change', payload);
    }

    return res.json({ success: true, message: `Order updated to ${status}`, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate & Download 80mm Thermal Receipt / KOT Baking Slip PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const type = req.query.type || 'final'; // 'kot' or 'final'
    const isDbConnected = getDbStatus();

    let order;
    if (isDbConnected) {
      order = await Order.findById(id);
    } else {
      order = memoryStore.orders.find(o => String(o._id) === String(id));
    }

    if (!order) return res.status(404).send('Order not found');

    await generateInvoicePDF(order, res, type);
  } catch (error) {
    console.error('Invoice PDF error:', error);
    res.status(500).send('Error generating PDF invoice slip.');
  }
};
