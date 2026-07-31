const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', verifyAdmin, categoryController.addCategory);
router.delete('/:id', verifyAdmin, categoryController.deleteCategory);

module.exports = router;
