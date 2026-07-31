const Category = require('../models/Category');
const { getDbStatus } = require('../config/db');
const { memoryStore, initialCategories } = require('../config/seedData');

exports.getCategories = async (req, res) => {
  try {
    const isDbConnected = getDbStatus();
    if (isDbConnected) {
      const categories = await Category.find().sort({ name: 1 });
      return res.json({ success: true, categories });
    } else {
      return res.json({ success: true, categories: memoryStore.categories });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const isDbConnected = getDbStatus();

    let newCat;
    if (isDbConnected) {
      const category = new Category({ name, icon: icon || '🍰', description: description || '', slug });
      newCat = await category.save();
    } else {
      newCat = { _id: 'cat_' + Date.now(), name, icon: icon || '🍰', description: description || '', slug, createdAt: new Date() };
      memoryStore.categories.push(newCat);
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('category_added', { category: newCat });
    }

    return res.status(201).json({ success: true, message: 'Category added successfully!', category: newCat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      await Category.findByIdAndDelete(id);
    } else {
      const idx = memoryStore.categories.findIndex(c => String(c._id) === String(id));
      if (idx !== -1) memoryStore.categories.splice(idx, 1);
    }

    return res.json({ success: true, message: 'Category removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
