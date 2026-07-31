const Offer = require('../models/Offer');
const { getDbStatus } = require('../config/db');
const { memoryStore } = require('../config/seedData');

// Get active offers for customer
exports.getOffers = async (req, res) => {
  try {
    const isDbConnected = getDbStatus();
    if (isDbConnected) {
      const offers = await Offer.find({ isActive: true });
      return res.json({ success: true, offers });
    } else {
      return res.json({ success: true, offers: memoryStore.offers.filter(o => o.isActive) });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all offers (including inactive)
exports.getAllOffersAdmin = async (req, res) => {
  try {
    const isDbConnected = getDbStatus();
    if (isDbConnected) {
      const offers = await Offer.find().sort({ createdAt: -1 });
      return res.json({ success: true, offers });
    } else {
      return res.json({ success: true, offers: memoryStore.offers });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply coupon code
exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required.' });

    const isDbConnected = getDbStatus();
    let offer;

    if (isDbConnected) {
      offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
    } else {
      offer = memoryStore.offers.find(o => o.code === code.toUpperCase() && o.isActive);
    }

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promo code.' });
    }

    if (cartTotal < offer.minOrderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of ₹${offer.minOrderAmount} required for this coupon.` 
      });
    }

    let calculatedDiscount = (cartTotal * offer.discountPercentage) / 100;
    if (offer.maxDiscount && calculatedDiscount > offer.maxDiscount) {
      calculatedDiscount = offer.maxDiscount;
    }

    return res.json({
      success: true,
      message: `Coupon "${offer.code}" applied! You saved ₹${calculatedDiscount.toFixed(2)}`,
      discount: calculatedDiscount,
      offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new offer
exports.createOffer = async (req, res) => {
  try {
    const { code, title, description, discountPercentage, minOrderAmount, maxDiscount, type } = req.body;
    const isDbConnected = getDbStatus();

    let newOffer;
    if (isDbConnected) {
      const offer = new Offer({
        code: code.toUpperCase(),
        title,
        description,
        discountPercentage: parseFloat(discountPercentage),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscount: parseFloat(maxDiscount || 500),
        type: type || 'Coupon',
        isActive: true
      });
      newOffer = await offer.save();
    } else {
      newOffer = {
        _id: 'off_' + Date.now(),
        code: code.toUpperCase(),
        title,
        description,
        discountPercentage: parseFloat(discountPercentage),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscount: parseFloat(maxDiscount || 500),
        type: type || 'Coupon',
        isActive: true,
        createdAt: new Date()
      };
      memoryStore.offers.unshift(newOffer);
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('offer_created', { offer: newOffer, message: `New Offer Started: Use ${newOffer.code} for ${newOffer.discountPercentage}% Off!` });
      io.emit('notification', {
        title: 'New Offer Started! 🎉',
        message: `${newOffer.title} - Get ${newOffer.discountPercentage}% Off using code ${newOffer.code}`,
        type: 'Offer Started'
      });
    }

    return res.status(201).json({ success: true, message: 'Offer created successfully!', offer: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Edit / Update offer
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, description, discountPercentage, minOrderAmount, maxDiscount, isActive } = req.body;
    const isDbConnected = getDbStatus();

    let updatedOffer;
    if (isDbConnected) {
      const offer = await Offer.findById(id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

      if (code) offer.code = code.toUpperCase();
      if (title) offer.title = title;
      if (description !== undefined) offer.description = description;
      if (discountPercentage) offer.discountPercentage = parseFloat(discountPercentage);
      if (minOrderAmount !== undefined) offer.minOrderAmount = parseFloat(minOrderAmount);
      if (maxDiscount !== undefined) offer.maxDiscount = parseFloat(maxDiscount);
      if (isActive !== undefined) offer.isActive = isActive === 'true' || isActive === true;

      updatedOffer = await offer.save();
    } else {
      const idx = memoryStore.offers.findIndex(o => String(o._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Offer not found.' });

      const existing = memoryStore.offers[idx];
      updatedOffer = {
        ...existing,
        code: code ? code.toUpperCase() : existing.code,
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : existing.discountPercentage,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : existing.minOrderAmount,
        maxDiscount: maxDiscount !== undefined ? parseFloat(maxDiscount) : existing.maxDiscount,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive
      };
      memoryStore.offers[idx] = updatedOffer;
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('offer_updated', { offer: updatedOffer });
    }

    return res.json({ success: true, message: 'Offer updated successfully!', offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      await Offer.findByIdAndDelete(id);
    } else {
      const idx = memoryStore.offers.findIndex(o => String(o._id) === String(id));
      if (idx !== -1) memoryStore.offers.splice(idx, 1);
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('offer_deleted', { offerId: id });
    }

    return res.json({ success: true, message: 'Offer removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
