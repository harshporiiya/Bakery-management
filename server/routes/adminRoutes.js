const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const { memoryStore } = require('../config/seedData');

router.get('/metrics', verifyAdmin, reportController.getDashboardMetrics);

// Get list of registered customers
router.get('/customers', verifyAdmin, async (req, res) => {
  try {
    const isDbConnected = getDbStatus();
    if (isDbConnected) {
      const customers = await User.find({ role: 'customer' }).select('-password');
      return res.json({ success: true, customers });
    } else {
      const customers = memoryStore.users
        .filter(u => u.role === 'customer')
        .map(u => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, rewardPoints: u.rewardPoints, createdAt: u.createdAt }));
      return res.json({ success: true, customers });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
