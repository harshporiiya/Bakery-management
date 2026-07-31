const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Offer = require('../models/Offer');
const { getDbStatus } = require('./db');

const initialCategories = [
  { name: 'Cakes', icon: '🍰', slug: 'cakes', description: 'Freshly baked artisanal cakes' },
  { name: 'Pastries', icon: '🥮', slug: 'pastries', description: 'Flaky & sweet pastries' },
  { name: 'Cookies', icon: '🍪', slug: 'cookies', description: 'Crispy butter cookies' },
  { name: 'Donuts', icon: '🍩', slug: 'donuts', description: 'Glazed & filled donuts' },
  { name: 'Brownies', icon: '🍫', slug: 'brownies', description: 'Rich chocolate brownies' },
  { name: 'Cupcakes', icon: '🧁', slug: 'cupcakes', description: 'Delightful mini cupcakes' },
  { name: 'Bread', icon: '🥖', slug: 'bread', description: 'Artisanal fresh breads & croissants' },
  { name: 'Pizza', icon: '🍕', slug: 'pizza', description: 'Cheesy fresh bakery pizzas' },
  { name: 'Sandwich', icon: '🥪', slug: 'sandwich', description: 'Gourmet stuffed sandwiches' },
  { name: 'Puff', icon: '🥟', slug: 'puff', description: 'Crispy savory puffs' },
  { name: 'Muffins', icon: '🥧', slug: 'muffins', description: 'Soft & moist muffins' },
  { name: 'Chocolates', icon: '🍫', slug: 'chocolates', description: 'Handcrafted luxury chocolates' },
  { name: 'Birthday Cakes', icon: '🎂', slug: 'birthday-cakes', description: 'Custom celebratory birthday cakes' },
  { name: 'Anniversary Cakes', icon: '💍', slug: 'anniversary-cakes', description: 'Elegant anniversary cakes' },
  { name: 'Wedding Cakes', icon: '👰', slug: 'wedding-cakes', description: 'Multi-tier luxury wedding cakes' },
  { name: 'Ice Cream Cake', icon: '🍦', slug: 'ice-cream-cake', description: 'Chilled ice cream layered cakes' },
  { name: 'Dry Cake', icon: '🥮', slug: 'dry-cake', description: 'Classic tea-time dry cakes' }
];

const initialProducts = [
  {
    name: 'Chocolate Truffle Cake',
    description: 'Decadent rich dark chocolate sponge layered with ganache and glossy glaze.',
    category: 'Cakes',
    price: 650,
    discount: 10,
    weight: '500g',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Vanilla Bean Cream Cake',
    description: 'Classic Madagascar vanilla sponge filled with silky whipped cream and fresh berries.',
    category: 'Cakes',
    price: 550,
    discount: 5,
    weight: '500g',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 24,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: 'Fresh Strawberry Cream Cake',
    description: 'Fluffy sponge cake loaded with fresh farm strawberries and whipped cream frosting.',
    category: 'Cakes',
    price: 620,
    discount: 15,
    weight: '500g',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Blueberry Delight Cake',
    description: 'Moist vanilla layers with organic blueberry compote and white chocolate curls.',
    category: 'Cakes',
    price: 680,
    discount: 8,
    weight: '500g',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 19,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Classic Black Forest Cake',
    description: 'German classic with dark chocolate layers, maraschino cherries, and whipped cream.',
    category: 'Cakes',
    price: 580,
    discount: 12,
    weight: '500g',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 56,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Velvety Red Velvet Cake',
    description: 'Crimson cocoa layers with smooth cream cheese frosting and red velvet crumbs.',
    category: 'Cakes',
    price: 700,
    discount: 10,
    weight: '500g',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1586788680404-3101201706e0?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 31,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: 'Belgian Chocolate Donut',
    description: 'Fluffy fried donut dipped in rich Belgian dark chocolate glaze with sprinkles.',
    category: 'Donuts',
    price: 90,
    discount: 0,
    weight: '100g',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 28,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Pink Strawberry Glazed Cupcake',
    description: 'Soft vanilla cupcake crowned with swirl strawberry buttercream frosting.',
    category: 'Cupcakes',
    price: 85,
    discount: 5,
    weight: '90g',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 17,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Choco Chip Crunch Cookies (6 Pcs)',
    description: 'Crispy outer edge with gooey melted chocolate chips inside.',
    category: 'Cookies',
    price: 180,
    discount: 10,
    weight: '250g',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 50,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Rich Butter Almond Cookies',
    description: 'Melt-in-your-mouth butter cookies topped with sliced roasted almonds.',
    category: 'Cookies',
    price: 220,
    discount: 15,
    weight: '300g',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 35,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Golden French Croissant',
    description: 'Layered buttery croissant baked to flaky golden perfection.',
    category: 'Bread',
    price: 120,
    discount: 0,
    weight: '120g',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 44,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Artisanal Garlic Sourdough Bread',
    description: 'Traditional slow-fermented sourdough infused with garlic butter and herbs.',
    category: 'Bread',
    price: 160,
    discount: 5,
    weight: '400g',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 22,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Paneer Tikka Bakery Pizza',
    description: 'Crispy bakery crust loaded with marinated paneer, capsicum, and mozzarella.',
    category: 'Pizza',
    price: 280,
    discount: 10,
    weight: '350g',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 64,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Gourmet Veg Grilled Sandwich',
    description: 'Tri-layered toasted sandwich with mint chutney, fresh veggies, and cheese slice.',
    category: 'Sandwich',
    price: 140,
    discount: 0,
    weight: '250g',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 29,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Spicy Veg Cheese Puff',
    description: 'Flaky golden puff pastry packed with spiced potato & corn filling.',
    category: 'Puff',
    price: 45,
    discount: 0,
    weight: '100g',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 78,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Fudge Walnut Brownie',
    description: 'Dense dark chocolate brownie embedded with crunchy California walnuts.',
    category: 'Brownies',
    price: 110,
    discount: 10,
    weight: '120g',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 88,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Blueberry Muffin',
    description: 'Moist golden muffin bursting with sweet juicy blueberries.',
    category: 'Muffins',
    price: 75,
    discount: 0,
    weight: '110g',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 21,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Handcrafted Chocolate Gift Box (12 Pcs)',
    description: 'Assorted luxury pralines, truffles, and caramel filled dark chocolates.',
    category: 'Chocolates',
    price: 499,
    discount: 15,
    weight: '250g',
    stock: 16,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 33,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: 'Royal Birthday Celebration Cake',
    description: 'Customized multi-layer birthday cake decorated with gold dust and macaroons.',
    category: 'Birthday Cakes',
    price: 1200,
    discount: 10,
    weight: '1kg',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 15,
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Golden Anniversary Hearts Cake',
    description: 'Heart-shaped red velvet & white chocolate cake created for special anniversaries.',
    category: 'Anniversary Cakes',
    price: 1450,
    discount: 12,
    weight: '1kg',
    stock: 4,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 11,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Grand 3-Tier Luxury Wedding Cake',
    description: 'Exquisite 3-tiered white fondant cake decorated with handcrafted sugar flowers.',
    category: 'Wedding Cakes',
    price: 3500,
    discount: 15,
    weight: '3kg',
    stock: 2,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 8,
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: 'Mango Ice Cream Layer Cake',
    description: 'Real Alphonso mango pulp frozen ice cream layers on almond sponge base.',
    category: 'Ice Cream Cake',
    price: 799,
    discount: 10,
    weight: '750g',
    stock: 6,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 19,
    isFeatured: false,
    isBestSeller: false
  },
  {
    name: 'Classic Tutti Frutti Dry Cake',
    description: 'Moist tea-time cake filled with candied fruits, raisins, and aromatic spices.',
    category: 'Dry Cake',
    price: 250,
    discount: 5,
    weight: '400g',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 41,
    isFeatured: false,
    isBestSeller: true
  }
];

const initialOffers = [
  {
    code: 'WELCOME10',
    title: '10% Welcome Off',
    description: 'Get 10% instant discount on your first bakery order!',
    discountPercentage: 10,
    minOrderAmount: 200,
    maxDiscount: 150,
    type: 'Coupon',
    isActive: true
  },
  {
    code: 'SWEET20',
    title: 'Festive Sweet 20%',
    description: '20% off on all Orders above ₹500',
    discountPercentage: 20,
    minOrderAmount: 500,
    maxDiscount: 300,
    type: 'Festival',
    isActive: true
  },
  {
    code: 'BOGO50',
    title: 'Buy 1 Get 1 Special',
    description: 'Special weekend BOGO offer on fresh pastries & muffins',
    discountPercentage: 50,
    minOrderAmount: 300,
    maxDiscount: 250,
    type: 'BOGO',
    isActive: true
  }
];

// Memory Data Store fallback if MongoDB is not connected
const memoryStore = {
  users: [],
  products: initialProducts.map((p, idx) => ({ ...p, _id: `prod_${idx + 1}` })),
  categories: initialCategories.map((c, idx) => ({ ...c, _id: `cat_${idx + 1}` })),
  offers: initialOffers.map((o, idx) => ({ ...o, _id: `off_${idx + 1}` })),
  orders: [
    {
      _id: 'ord_1001',
      orderNumber: 'ORD-9821',
      customerId: 'user_cust_1',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul@gmail.com',
      customerPhone: '+91 9876543210',
      items: [
        { productId: 'prod_1', name: 'Chocolate Truffle Cake', price: 650, quantity: 1, image: initialProducts[0].image, weight: '500g' },
        { productId: 'prod_7', name: 'Belgian Chocolate Donut', price: 90, quantity: 2, image: initialProducts[6].image, weight: '100g' }
      ],
      subtotal: 830,
      gst: 41.5,
      deliveryCharge: 40,
      discount: 83,
      grandTotal: 828.5,
      paymentMethod: 'UPI',
      paymentStatus: 'Completed',
      orderStatus: 'Preparing',
      shippingAddress: { street: '402 Sunrise Heights', city: 'Ahmedabad', zip: '380015' },
      trackingTimeline: [
        { status: 'Pending', time: new Date(Date.now() - 3600000), note: 'Order placed by customer' },
        { status: 'Preparing', time: new Date(Date.now() - 1800000), note: 'Bakery chef accepted order' }
      ],
      createdAt: new Date(Date.now() - 3600000)
    }
  ],
  reviews: [
    {
      _id: 'rev_1',
      productId: 'prod_1',
      userId: 'user_cust_1',
      userName: 'Rahul Sharma',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Absolutely divine dark chocolate truffle! Fresh, moist and delivered right on time.',
      likes: 12,
      replies: [{ userName: 'Sweet Delight Team', text: 'Thank you Rahul! So happy you loved it.', date: new Date() }],
      createdAt: new Date(Date.now() - 86400000)
    }
  ],
  notifications: []
};

const seedDatabase = async () => {
  try {
    const isDbConnected = getDbStatus();

    // Create default Admin user
    const adminEmail = 'admin@bakery.com';
    let adminUser;

    if (isDbConnected) {
      adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        adminUser = new User({
          name: 'Sweet Delight Admin',
          email: adminEmail,
          password: 'admin123',
          role: 'admin',
          phone: '+91 9999988888',
          rewardPoints: 999
        });
        await adminUser.save();
        console.log('Default Admin Created (admin@bakery.com / admin123)');
      }

      // Seed Categories if empty
      const catCount = await Category.countDocuments();
      if (catCount === 0) {
        await Category.insertMany(initialCategories);
        console.log('Default Categories seeded.');
      }

      // Seed Products if empty
      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        await Product.insertMany(initialProducts);
        console.log('Default Bakery Products seeded.');
      }

      // Seed Offers if empty
      const offerCount = await Offer.countDocuments();
      if (offerCount === 0) {
        await Offer.insertMany(initialOffers);
        console.log('Default Offers seeded.');
      }
    } else {
      // In-Memory store admin setup
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      memoryStore.users.push({
        _id: 'admin_user_1',
        name: 'Sweet Delight Admin',
        email: 'admin@bakery.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 9999988888',
        rewardPoints: 999,
        createdAt: new Date()
      });
      console.log('In-Memory Seed Loaded successfully.');
    }
  } catch (err) {
    console.error('Error during database seed:', err.message);
  }
};

module.exports = { seedDatabase, memoryStore, initialProducts, initialCategories, initialOffers };
