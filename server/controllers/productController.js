const Product = require('../models/Product');
const { getDbStatus } = require('../config/db');
const { memoryStore, initialProducts } = require('../config/seedData');

// Fetch all products with filter, search, sort
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, minRating, sort, isEnabled } = req.query;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      let query = {};
      if (isEnabled !== undefined) query.isEnabled = isEnabled === 'true';
      if (category && category !== 'All') query.category = category;
      if (minRating) query.rating = { $gte: parseFloat(minRating) };
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      let sortOptions = {};
      if (sort === 'price-low') sortOptions.price = 1;
      else if (sort === 'price-high') sortOptions.price = -1;
      else if (sort === 'rating') sortOptions.rating = -1;
      else if (sort === 'popular') sortOptions.reviewsCount = -1;
      else sortOptions.createdAt = -1;

      const products = await Product.find(query).sort(sortOptions);
      return res.json({ success: true, count: products.length, products });
    } else {
      // In-memory filtering
      let products = [...memoryStore.products];

      if (isEnabled !== undefined) {
        const flag = isEnabled === 'true';
        products = products.filter(p => p.isEnabled === undefined || p.isEnabled === flag);
      }
      if (category && category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const term = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(term) || 
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
        );
      }
      if (minPrice) products = products.filter(p => p.price >= parseFloat(minPrice));
      if (maxPrice) products = products.filter(p => p.price <= parseFloat(maxPrice));
      if (minRating) products = products.filter(p => p.rating >= parseFloat(minRating));

      if (sort === 'price-low') products.sort((a, b) => a.price - b.price);
      else if (sort === 'price-high') products.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
      else if (sort === 'popular') products.sort((a, b) => b.reviewsCount - a.reviewsCount);

      return res.json({ success: true, count: products.length, products });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, product });
    } else {
      const product = memoryStore.products.find(p => String(p._id) === String(id));
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product (Admin) - Emits Socket.IO Real-time update
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, discount, weight, stock, isFeatured, isBestSeller } = req.body;
    
    let imageUrl = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const newProductData = {
      name,
      description,
      category,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      weight: weight || '500g',
      stock: stock ? parseInt(stock) : 10,
      image: imageUrl,
      rating: 5.0,
      reviewsCount: 1,
      isEnabled: true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      createdAt: new Date()
    };

    const isDbConnected = getDbStatus();
    let savedProduct;

    if (isDbConnected) {
      const product = new Product(newProductData);
      savedProduct = await product.save();
    } else {
      savedProduct = { ...newProductData, _id: 'prod_' + Date.now() };
      memoryStore.products.unshift(savedProduct);
    }

    // Broadcast Real-time socket event to ALL logged-in customers
    const io = req.app.get('socketio');
    if (io) {
      io.emit('product_added', { product: savedProduct, message: `New product "${savedProduct.name}" added!` });
      io.emit('notification', {
        title: 'New Product Added!',
        message: `${savedProduct.name} is now available in ${savedProduct.category}!`,
        type: 'Product Added'
      });
    }

    res.status(201).json({ success: true, message: 'Product created successfully!', product: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product (Admin) - Emits Socket.IO Real-time update
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, discount, weight, stock, isEnabled, isFeatured, isBestSeller } = req.body;

    const isDbConnected = getDbStatus();
    let updatedProduct;
    let priceChanged = false;
    let stockChanged = false;

    if (isDbConnected) {
      const existing = await Product.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

      if (price && parseFloat(price) !== existing.price) priceChanged = true;
      if (stock !== undefined && parseInt(stock) !== existing.stock) stockChanged = true;

      if (name) existing.name = name;
      if (description) existing.description = description;
      if (category) existing.category = category;
      if (price) existing.price = parseFloat(price);
      if (discount !== undefined) existing.discount = parseFloat(discount);
      if (weight) existing.weight = weight;
      if (stock !== undefined) existing.stock = parseInt(stock);
      if (isEnabled !== undefined) existing.isEnabled = isEnabled === 'true' || isEnabled === true;
      if (isFeatured !== undefined) existing.isFeatured = isFeatured === 'true' || isFeatured === true;
      if (isBestSeller !== undefined) existing.isBestSeller = isBestSeller === 'true' || isBestSeller === true;

      if (req.file) {
        existing.image = `/uploads/${req.file.filename}`;
      } else if (req.body.imageUrl) {
        existing.image = req.body.imageUrl;
      }

      updatedProduct = await existing.save();
    } else {
      const existingIndex = memoryStore.products.findIndex(p => String(p._id) === String(id));
      if (existingIndex === -1) return res.status(404).json({ success: false, message: 'Product not found.' });

      const existing = memoryStore.products[existingIndex];
      if (price && parseFloat(price) !== existing.price) priceChanged = true;

      updatedProduct = {
        ...existing,
        name: name || existing.name,
        description: description || existing.description,
        category: category || existing.category,
        price: price ? parseFloat(price) : existing.price,
        discount: discount !== undefined ? parseFloat(discount) : existing.discount,
        weight: weight || existing.weight,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        isEnabled: isEnabled !== undefined ? (isEnabled === 'true' || isEnabled === true) : existing.isEnabled,
        image: req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || existing.image)
      };
      memoryStore.products[existingIndex] = updatedProduct;
    }

    // Broadcast Real-time socket update to ALL connected clients
    const io = req.app.get('socketio');
    if (io) {
      io.emit('product_updated', { product: updatedProduct, message: `Product "${updatedProduct.name}" updated live!` });
      if (priceChanged) {
        io.emit('notification', {
          title: 'Price Updated!',
          message: `Price for ${updatedProduct.name} changed to ₹${updatedProduct.price}`,
          type: 'Price Updated'
        });
      }
      if (stockChanged && updatedProduct.stock === 0) {
        io.emit('notification', {
          title: 'Stock Out Alert!',
          message: `${updatedProduct.name} is currently out of stock.`,
          type: 'Stock Finished'
        });
      }
    }

    return res.json({ success: true, message: 'Product updated successfully!', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product (Admin) - Emits Socket.IO Real-time update
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDbStatus();
    let deletedProduct;

    if (isDbConnected) {
      deletedProduct = await Product.findByIdAndDelete(id);
    } else {
      const idx = memoryStore.products.findIndex(p => String(p._id) === String(id));
      if (idx !== -1) {
        deletedProduct = memoryStore.products.splice(idx, 1)[0];
      }
    }

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Broadcast Socket.IO event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('product_deleted', { productId: id, message: 'Product removed from catalog.' });
    }

    return res.json({ success: true, message: 'Product removed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
