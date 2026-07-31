# Sweet Delight Bakery Management System 🍰

A full-stack, real-time Bakery Management System where customers can browse gourmet bakery products, customize cart orders, track live order status timelines, and receive real-time Socket.IO inventory/price updates, while the owner manages sales metrics, products, offers, categories, and PDF invoices via an Admin Dashboard.

## 🚀 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism UI, Dark/Light Mode, CSS Variables), ES6 JavaScript, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO Server.
- **Database**: MongoDB & Mongoose ORM (with automatic fallback seed mode).
- **Authentication**: JWT Login with role-based authorization (`customer` vs `admin`), bcrypt password hashing.
- **File Uploads**: Multer image upload engine.
- **Invoice & QR**: Server-side PDFKit generator with payment QR code.

---

## 🔑 Default Credentials

### Owner (Admin) Account
- **Email**: `admin@bakery.com`
- **Password**: `admin123`

---

## ⚡ Features Overview

### 1. Customer Features
- **Modern Landing Page**: Dynamic product showcase, category filter bar (Cakes, Pastries, Cookies, Donuts, Brownies, Cupcakes, Bread, Pizza, Sandwich, Puff, Muffins, Chocolates, Birthday/Anniversary/Wedding Cakes, Ice Cream Cake, Dry Cake).
- **Live Search & Multi-Filter**: Search by title, filter by price range, star rating, or sort by low/high price, newest, or popularity.
- **Shopping Cart & Checkout**:
  - Quantity controls & item removal.
  - Subtotal, GST (5%), delivery fees, and instant promo code application.
  - Multiple Payment methods: Cash on Delivery, UPI, Google Pay, PhonePe, Paytm, Credit/Debit Card, Net Banking.
- **Real-Time Order Tracking**: Live timeline tracker (Pending → Preparing → Baking → Packed → Out for Delivery → Delivered).
- **Tax Invoice Download**: Download professional PDF invoice with itemized breakdown and payment QR code.
- **Dark/Light Mode**: Toggle persistent glassmorphic themes.

### 2. Owner (Admin) Features
- **Live Sales Dashboard**: Metrics cards for Today's Sales, Today's Orders, Pending Orders, Customers, Products, Revenue, Best Seller, Monthly Income.
- **Sales Analytics Chart**: Interactive SVG sales trend chart for the last 7 days.
- **Product Management**:
  - Add new products with file photo upload or image URL.
  - Quick inline price & stock updates.
  - Enable/Disable product visibility.
  - Instant Socket.IO real-time broadcast to all connected customers without refreshing the page!
- **Live Order Status Dispatch**: Change order status state with single-click actions.
- **Category & Offer Manager**: Create custom promo codes, festival sales, and BOGO deals.

---

## 🛠️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd Bakery-Management-System
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Application**:
   ```bash
   npm start
   ```

4. **Access the Application**:
   - Storefront: `http://localhost:5000`
   - Owner Login: `http://localhost:5000/pages/login.html` (or click "One-Click Owner Login")

run command:

D:
cd "d:\my_work\B.Tech\sem 5\Backery Management"
npm start

when 5000 server is busy then run this command fisrt:
npx kill-port 5000

then run:
npm start