const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getCustomerOrders);
router.get('/invoice/:id', orderController.downloadInvoice);

// Admin Order Endpoints
router.get('/admin/all', verifyAdmin, orderController.getAllOrders);
router.put('/admin/status/:id', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
