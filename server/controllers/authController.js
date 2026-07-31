const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { getDbStatus } = require('../config/db');
const { memoryStore } = require('../config/seedData');

// Register Customer (with address info)
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, street, city, zip } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
      }

      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        address: {
          street: street || '',
          city: city || '',
          zip: zip || ''
        },
        role: 'customer'
      });
      await user.save();

      const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, rewardPoints: user.rewardPoints, avatar: user.avatar, phone: user.phone, address: user.address }
      });
    } else {
      // In-Memory Fallback
      const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        address: {
          street: street || '',
          city: city || '',
          zip: zip || ''
        },
        role: 'customer',
        rewardPoints: 50,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      };
      memoryStore.users.push(newUser);

      const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, rewardPoints: newUser.rewardPoints, avatar: newUser.avatar, phone: newUser.phone, address: newUser.address }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login (Customer or Admin)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const isDbConnected = getDbStatus();

    let user;
    if (isDbConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ success: false, message: 'you are first login then sign up' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid password.' });
      }

      const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, rewardPoints: user.rewardPoints, avatar: user.avatar, phone: user.phone, address: user.address }
      });
    } else {
      // In-Memory check
      user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Admin fallback check
      if (!user && email.toLowerCase() === 'admin@bakery.com' && password === 'admin123') {
        const token = jwt.sign({ id: 'admin_1', role: 'admin', email: 'admin@bakery.com' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          success: true,
          message: 'Welcome back, Admin!',
          token,
          user: { id: 'admin_1', name: 'Sweet Delight Admin', email: 'admin@bakery.com', role: 'admin', rewardPoints: 999 }
        });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'you are first login then sign up' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid password.' });
      }

      const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, rewardPoints: user.rewardPoints, avatar: user.avatar, phone: user.phone, address: user.address }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const isDbConnected = getDbStatus();
    if (isDbConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this email.' });
      }
      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password updated successfully! You can now login.' });
    } else {
      const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this email.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
      return res.json({ success: true, message: 'Password updated successfully! You can now login.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.json({ success: true, user });
    } else {
      const user = memoryStore.users.find(u => String(u._id) === String(userId)) || {
        _id: userId,
        name: req.user.role === 'admin' ? 'Sweet Delight Admin' : 'Customer',
        email: req.user.email,
        role: req.user.role,
        rewardPoints: 120
      };
      return res.json({ success: true, user });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, street, city, zip } = req.body;
    const isDbConnected = getDbStatus();

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (street || city || zip) {
        user.address = {
          street: street || user.address.street,
          city: city || user.address.city,
          zip: zip || user.address.zip
        };
      }
      await user.save();
      return res.json({ success: true, message: 'Profile updated successfully!', user });
    } else {
      const user = memoryStore.users.find(u => String(u._id) === String(userId));
      if (user) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        user.address = { street: street || '', city: city || '', zip: zip || '' };
      }
      return res.json({ success: true, message: 'Profile updated successfully!', user });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
