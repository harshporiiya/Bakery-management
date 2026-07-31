const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', offerController.getOffers);
router.get('/admin/all', verifyAdmin, offerController.getAllOffersAdmin);
router.post('/apply', offerController.applyCoupon);
router.post('/', verifyAdmin, offerController.createOffer);
router.put('/:id', verifyAdmin, offerController.updateOffer);
router.delete('/:id', verifyAdmin, offerController.deleteOffer);

module.exports = router;
