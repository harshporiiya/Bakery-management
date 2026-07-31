const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const { memoryStore } = require('../config/seedData');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const isDbConnected = getDbStatus();

    let allOrders = [];
    let allProducts = [];
    let totalCustomersCount = 0;

    if (isDbConnected) {
      allOrders = await Order.find();
      allProducts = await Product.find();
      totalCustomersCount = await User.countDocuments({ role: 'customer' });
    } else {
      allOrders = memoryStore.orders;
      allProducts = memoryStore.products;
      totalCustomersCount = memoryStore.users.filter(u => u.role === 'customer').length || 1;
    }

    // Get strictly current date starting at 12:00 AM (Midnight reset)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Today's orders strictly placed after 12:00 AM today
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfToday);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const todayOrdersCount = todayOrders.length;

    const pendingOrdersCount = allOrders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    
    // Monthly income (current calendar month)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyIncome = allOrders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Calculate Best Seller Product
    const productSalesMap = {};
    allOrders.forEach(order => {
      (order.items || []).forEach(item => {
        productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.quantity;
      });
    });

    let bestSellerName = 'None';
    let maxQuantity = 0;
    Object.keys(productSalesMap).forEach(pName => {
      if (productSalesMap[pName] > maxQuantity) {
        maxQuantity = productSalesMap[pName];
        bestSellerName = pName;
      }
    });

    // Chart Data Generation (Last 7 Days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7DaysLabels = [];
    const salesData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayLabel = days[d.getDay()];

      last7DaysLabels.push(dayLabel);
      const dayOrders = allOrders.filter(o => {
        const created = new Date(o.createdAt);
        return created >= dayStart && created <= dayEnd;
      });
      const dayRev = dayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      salesData.push(dayRev);
    }

    return res.json({
      success: true,
      metrics: {
        todaySales: todaySales,
        todayOrders: todayOrdersCount,
        pendingOrders: pendingOrdersCount,
        customers: totalCustomersCount,
        products: allProducts.length,
        totalRevenue: totalRevenue,
        bestSeller: bestSellerName,
        monthlyIncome: monthlyIncome
      },
      charts: {
        labels: last7DaysLabels,
        sales: salesData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
