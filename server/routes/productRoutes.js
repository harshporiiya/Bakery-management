const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin product endpoints
router.post('/', verifyAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyAdmin, productController.deleteProduct);

module.exports = router;
