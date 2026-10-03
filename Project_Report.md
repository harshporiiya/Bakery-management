
# PROJECT REPORT

---

<div align="center">

## Sweet Delight — Bakery Management System

**Web Application Development (WAD) — Semester 5 Project**

---

| **Programme** | B.Tech (Computer Engineering) |
|---|---|
| **Subject** | Web Application Development (WAD) |
| **Project Title** | Sweet Delight — Bakery Management System |
| **Technology** | Node.js · Express.js · MongoDB · Socket.IO · Vanilla JS |
| **Academic Year** | 2025–2026 |

</div>

---

## TABLE OF CONTENTS

| SR NO. | TITLE | PAGE NO. |
|--------|-------|----------|
| 1 | Introduction | 1 |
| 2 | Project Objectives & Scope | 2 |
| 3 | Technology Stack | 3 |
| 4 | System Design & UI/UX Principles | 4 |
| 5 | Implementation Details | 5 |
| 6 | System Workflow & State Management | 6 |
| 7 | Output Screens (Project Screenshots) | 7 |
| 8 | Future Scope (Phase 2 Integration) | 11 |
| 9 | Conclusion | 11 |

---

---

## 1. Introduction

The **Sweet Delight Bakery Management System** is a full-stack, real-time web application developed as part of the Web Application Development (WAD) curriculum for Semester 5 of B.Tech (Computer Engineering). It digitally transforms the end-to-end workflow of a modern bakery — from storefront browsing to order fulfilment — eliminating manual processes and enhancing transparency for both customers and the bakery owner.

Traditional bakeries rely heavily on in-person ordering, physical billing, and verbal order tracking, which leads to errors, delays, and poor customer experience. This project addresses those pain-points by providing:

- A rich **customer-facing storefront** where users can browse products, filter by category/rating/price, apply promo codes, and checkout via multiple payment modes.
- A powerful **admin dashboard** that gives the bakery owner live sales metrics, stock management, order dispatch control, and downloadable PDF invoices.
- **Real-time bidirectional communication** via Socket.IO so that both customers and the admin see updates — new orders, stock changes, and delivery status — instantly without page refreshes.

The system is named *Sweet Delight* and supports **15+ product categories** (Cakes, Pastries, Cookies, Donuts, Brownies, Cupcakes, Bread, Pizza, Sandwich, Puff, Muffins, Chocolates, Birthday/Anniversary/Wedding Cakes, Ice Cream Cake, Dry Cake), making it applicable to a wide variety of real-world bakery establishments.

> **Live Server Port:** `http://localhost:5000`
> **Admin Credentials:** `admin@bakery.com` / `admin123`

---

---

## 2. Project Objectives & Scope

### 2.1 Objectives

1. **Digitise the Order Pipeline** — Replace paper-based or verbal ordering with an online, traceable system.
2. **Enable Real-Time Operations** — Use WebSocket (Socket.IO) to push live updates for orders, stock, and notifications to all connected clients simultaneously.
3. **Implement Role-Based Access Control (RBAC)** — Differentiate between `customer` and `admin` roles, ensuring each actor sees only the features relevant to them.
4. **Automate Financial Documents** — Generate professional PDF tax invoices with itemised breakdowns, GST calculation, and payment QR codes using PDFKit.
5. **Provide Actionable Business Analytics** — Equip the admin with a live sales dashboard, 7-day SVG trend chart, best-seller identification, and revenue metrics.
6. **Support Multiple Payment Modes** — Offer Cash on Delivery, UPI, Google Pay, PhonePe, Paytm, Credit/Debit Card, and Net Banking as checkout options.
7. **Enhance UX through Modern Design** — Implement a Glassmorphism + Dark/Light Mode UI with smooth animations for a premium customer experience.

### 2.2 Scope

| In Scope | Out of Scope |
|---|---|
| Customer registration & login (JWT) | Third-party delivery partner integration |
| Product catalogue with 15+ categories | Native mobile application (iOS/Android) |
| Shopping cart, GST & promo codes | Live payment gateway (Razorpay/Stripe) |
| Real-time order tracking (6 statuses) | AI-powered demand forecasting |
| Admin product/stock/offer management | Multi-branch support |
| PDF invoice generation & QR codes | Customer loyalty programme automation |
| Socket.IO live push notifications | Email/SMS notification service |
| Dark/Light mode toggle | Third-party analytics (Google Analytics) |

### 2.3 Target Users

- **Customers** — General public who want to browse and order bakery products online.
- **Bakery Owner / Admin** — The shop owner who manages inventory, prices, orders, and offers.

---

---

## 3. Technology Stack

### 3.1 Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | v18+ | JavaScript runtime environment |
| **Express.js** | ^4.21.2 | HTTP REST API framework |
| **Socket.IO** | ^4.8.1 | Real-time WebSocket communication |
| **MongoDB** | Cloud / Local | NoSQL document database |
| **Mongoose** | ^9.9.0 | MongoDB ODM (Object-Document Mapper) |
| **bcryptjs** | ^3.0.3 | Password hashing (salt rounds: 10) |
| **jsonwebtoken** | ^9.0.2 | JWT-based stateless authentication |
| **multer** | ^1.4.5-lts.1 | Image/file upload middleware |
| **pdfkit** | ^0.17.2 | Server-side PDF invoice generation |
| **qrcode** | ^1.5.4 | Payment QR code embedding in PDFs |
| **dotenv** | ^17.0.1 | Environment variable management |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing |

### 3.2 Frontend

| Technology | Role |
|---|---|
| **HTML5** | Semantic markup for all pages |
| **Vanilla CSS3** | Glassmorphism UI, CSS Variables, Dark/Light mode, responsive grid |
| **ES6 JavaScript** | Fetch API, async/await, DOM manipulation, modular scripts |
| **Socket.IO Client** | Real-time event subscription on the browser |

### 3.3 Architecture Pattern

The system follows a **MVC (Model-View-Controller)** architectural pattern:

```
+----------------------------------------------------+
|                    CLIENT (Browser)                |
|  HTML Pages  <->  Vanilla JS  <->  Socket.IO Client|
+----------------------+-----------------------------+
                       |  HTTP REST + WebSocket
+----------------------v-----------------------------+
|                EXPRESS.JS SERVER                   |
|  Routes -> Middleware (JWT/Multer) -> Controllers  |
|                  Socket.IO Server                  |
+----------------------+-----------------------------+
                       |  Mongoose ODM
+----------------------v-----------------------------+
|            MONGODB (+ In-Memory Fallback)          |
|  Users . Products . Orders . Offers . Categories   |
+----------------------------------------------------+
```

### 3.4 Key Architectural Decisions

- **Dual-mode persistence**: If MongoDB is unavailable, the system automatically falls back to an **in-memory seed store**, allowing demos without a database connection.
- **Socket.IO room strategy**: Admin socket joins `admin_room`; customers join `user_<id>` rooms for targeted live notifications.
- **JWT stored in localStorage**: Stateless, eliminating server-side session management overhead.

---

---

## 4. System Design & UI/UX Principles

### 4.1 UI Design Language — Glassmorphism

The entire frontend is built with a **Glassmorphism** design system — a modern visual style characterised by:

- Semi-transparent frosted-glass panels (`backdrop-filter: blur(...)`)
- Layered depth with subtle border highlights
- Gradient overlays on hero sections and cards
- Warm gold (`#f6c90e`) and chocolate brown (`#5c3a1e`) as brand palette colours

### 4.2 Theming — Dark & Light Mode

- CSS Custom Properties (`--bg-primary`, `--text-primary`, `--glass-bg`, etc.) power the entire theme system.
- A `data-theme="dark|light"` attribute on `<html>` switches all variables simultaneously.
- Theme preference is persisted to `localStorage` so it survives page reloads.

### 4.3 Page Structure

| Page | File | Description |
|---|---|---|
| **Storefront (Home)** | `client/index.html` | Product grid, category filter bar, hero section, offers |
| **Cart & Checkout** | `client/pages/cart.html` | Cart items, GST, promo code, payment method, order summary |
| **Customer Profile** | `client/pages/profile.html` | Order history, live tracking timeline, invoice download |
| **Admin Dashboard** | `client/pages/dashboard.html` | Metrics cards, SVG chart, product/order/offer management |
| **Login** | `client/pages/login.html` | JWT login, one-click admin access |
| **Sign Up** | `client/pages/signup.html` | Customer registration |

### 4.4 Responsive Design

- CSS Grid (`auto-fill`, `minmax`) for the product catalogue adapts from 1 column (mobile) to 4 columns (desktop).
- Horizontal scroll category chip bar for touch-friendly category navigation.
- Navbar collapses to icon-only on smaller viewports.

### 4.5 UX Micro-Animations

- Hover lift effects (`transform: translateY(-4px)`) on product cards.
- Gradient shimmer loaders while API data is fetched.
- Toast notifications slide in from the top-right corner for real-time events.
- Modal overlays with backdrop blur for quick product details.

---

---

## 5. Implementation Details

### 5.1 Project File Structure

```
Bakery Management WAD/
|-- client/
|   |-- index.html                   <- Storefront landing page
|   |-- css/
|   |   +-- style.css                <- Full Glassmorphism design system
|   |-- js/
|   |   |-- app.js                   <- Product listing, filters, search
|   |   |-- admin.js                 <- Admin dashboard logic
|   |   |-- auth.js                  <- JWT login/signup helpers
|   |   |-- cart.js                  <- Cart, checkout, promo codes
|   |   +-- socket-client.js         <- Socket.IO event subscriptions
|   +-- pages/
|       |-- cart.html
|       |-- dashboard.html
|       |-- login.html
|       |-- profile.html
|       +-- signup.html
|-- server/
|   |-- server.js                    <- HTTP server + Socket.IO bootstrap
|   |-- app.js                       <- Express app, middleware, routes
|   |-- config/
|   |   |-- db.js                    <- MongoDB connection & status flag
|   |   +-- seedData.js              <- Auto-seed + in-memory fallback store
|   |-- controllers/
|   |   |-- authController.js        <- Register, login, JWT issue
|   |   |-- productController.js     <- CRUD products, image upload
|   |   |-- orderController.js       <- Place order, update status, invoice
|   |   |-- offerController.js       <- Promo codes, festival deals
|   |   |-- categoryController.js    <- Category CRUD
|   |   +-- reportController.js      <- Sales metrics & analytics
|   |-- middleware/
|   |   +-- authMiddleware.js        <- JWT verify, role guard
|   |-- models/
|   |   |-- User.js
|   |   |-- Product.js
|   |   |-- Order.js
|   |   |-- Offer.js
|   |   |-- Category.js
|   |   |-- Notification.js
|   |   +-- Review.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- productRoutes.js
|   |   |-- orderRoutes.js
|   |   |-- offerRoutes.js
|   |   |-- categoryRoutes.js
|   |   +-- adminRoutes.js
|   |-- sockets/
|   |   +-- socketHandler.js         <- Room join, event definitions
|   +-- utils/
|       +-- pdfGenerator.js          <- PDFKit invoice builder
|-- package.json
+-- README.md
```

### 5.2 Database Schema (Mongoose Models)

#### User Model
```
{ name, email (unique), password (bcrypt), role: ['customer'|'admin'],
  avatar, phone, address: {street, city, zip}, rewardPoints, createdAt }
```

#### Product Model
```
{ name, description, category, price, discount, weight, stock,
  image, rating, reviewsCount, isEnabled, isFeatured, isBestSeller, createdAt }
```

#### Order Model
```
{ orderNumber (unique), customerId, customerName, customerEmail, customerPhone,
  items: [orderItemSchema], subtotal, gst, deliveryCharge, discount, grandTotal,
  paymentMethod, paymentStatus, orderStatus, shippingAddress,
  trackingTimeline: [timelineSchema], createdAt }
  
  orderStatus enum:
  Pending -> Preparing -> Baking -> Packed -> Out for Delivery -> Delivered | Rejected
```

#### Offer Model
```
{ code, description, discountType: ['percent'|'flat'], discountValue,
  minOrderAmount, maxUses, usedCount, expiresAt, isActive }
```

### 5.3 REST API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Customer registration |
| `POST` | `/api/auth/login` | Public | Login & JWT issue |
| `GET` | `/api/products` | Public | Fetch all active products |
| `POST` | `/api/products` | Admin | Add new product (with image) |
| `PUT` | `/api/products/:id` | Admin | Update price/stock/enable |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `POST` | `/api/orders` | Customer | Place new order |
| `GET` | `/api/orders/my` | Customer | Fetch own orders |
| `GET` | `/api/orders/admin/all` | Admin | Fetch all orders |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status |
| `GET` | `/api/orders/:id/invoice` | Customer | Download PDF invoice |
| `GET` | `/api/offers` | Public | Fetch active offers |
| `POST` | `/api/offers/validate` | Customer | Validate promo code |
| `GET` | `/api/admin/reports` | Admin | Sales metrics & analytics |

### 5.4 Authentication & Security

- Passwords are hashed using **bcryptjs** with a salt round of 10 before storage.
- **JWT tokens** (signed with `JWT_SECRET` from `.env`) are returned on login with a 7-day expiry.
- The `authMiddleware.js` verifies the token on every protected route; a separate `requireAdmin` guard rejects non-admin tokens with HTTP 403.
- **CORS** is configured to allow all origins in development mode.

### 5.5 PDF Invoice Generation

The `pdfGenerator.js` utility uses **PDFKit** to produce a professional A4 tax invoice containing:
- Bakery logo/header, order number, customer details
- Itemised table with quantity, unit price, discount, and line total
- Subtotal, GST (5%), delivery charge, promo discount, and grand total
- **QR code** (generated via `qrcode`) embedding the UPI payment string
- Two invoice types: `final` (customer tax invoice) and `kot` (Kitchen Order Ticket / baking slip)

---

---

## 6. System Workflow & State Management

### 6.1 Customer Journey

```
[Landing Page]
      |
      v
[Browse Products]  <-- Filter: Category / Search / Price / Rating / Sort
      |
      v
[Add to Cart]  -->  Cart Badge Count updates instantly (localStorage)
      |
      v
[Cart Page]
  |-- Apply Promo Code (API validate) --> Instant discount
  |-- Select Payment Method
  +-- Place Order (POST /api/orders)
      |
      v
[Order Confirmation]  <-- Socket "notification" event fired to all clients
      |
      v
[Profile Page --> Order History]
  |-- Live Tracking Timeline (Pending -> Preparing -> Baking -> Packed -> Delivered)
  +-- Download PDF Invoice
```

### 6.2 Admin Workflow

```
[Admin Login]  -->  JWT role = 'admin'  -->  Redirected to Dashboard
      |
      |-- [Dashboard]
      |      |-- Metrics: Today's Sales, Orders, Revenue, Best Seller
      |      +-- 7-Day SVG Sales Chart
      |
      |-- [Orders Tab]
      |      |-- View all orders, filter by status
      |      +-- Update status --> Socket emits 'order_status_change'
      |                            to customer's private room
      |
      |-- [Products Tab]
      |      |-- Add product (form + image upload via Multer)
      |      |-- Inline price & stock edit
      |      |-- Enable/Disable toggle
      |      +-- Socket emits 'product_updated' to ALL clients
      |
      +-- [Offers Tab]
             |-- Create promo codes (%, flat, BOGO)
             +-- Set expiry, min. order, max uses
```

### 6.3 Real-Time Socket.IO Event Map

| Event Name | Direction | Trigger | Payload |
|---|---|---|---|
| `join_room` | Client -> Server | User login | `{ userId }` |
| `join_admin` | Client -> Server | Admin login | — |
| `new_order_admin` | Server -> Admin | Customer places order | `{ order, message }` |
| `order_status_change` | Server -> Customer | Admin updates status | `{ orderId, status, timeline }` |
| `product_updated` | Server -> All | Admin edits product / order deducts stock | `{ product, message }` |
| `notification` | Server -> All | New order placed | `{ title, message, type }` |

### 6.4 Cart State Management

Cart items are persisted in **`localStorage`** under the key `bakery_cart`. This allows:
- Cart to survive page navigation and refresh without any server call.
- Instant cart badge count update on the navbar.
- Seamless cart retrieval at checkout.

### 6.5 Dual-Mode Persistence

```
App Start
    |
    |-- MongoDB connected? --Yes--> Use MongoDB (Mongoose queries)
    |
    +-- No connection ------------> Use in-memory seedData store
                                    (auto-seeded with demo products/orders/offers)
```

This ensures the application is **always demonstrable** even without a live database.

---

---

## 7. Output Screens (Project Screenshots)

> *Screenshots are to be attached from the running application at `http://localhost:5000`.*

### Screen 1 — Storefront / Landing Page (Home)

**URL:** `http://localhost:5000`

**Description:**
The hero section features a full-width banner with the bakery name, tagline, and CTA buttons ("Explore Menu" and "Shop Now"). Below it, a horizontally scrollable category chip bar lets users filter by 15+ product categories. The product catalogue renders in a responsive CSS grid showing product cards with image, name, category badge, rating stars, price (with discount badge if applicable), and an "Add to Cart" button. A live search bar and sort/rating filter dropdowns sit above the grid. Special offers and promo codes are rendered in a dedicated section further down the page.

**Key UI Elements:**
- Glass-panel sticky navbar with cart badge counter
- Hero section with gradient overlay and animated badges
- Category chip scroll bar (horizontal)
- Product cards with hover lift animations
- Quick-view modal on card click
- Dark/Light mode toggle button

---

### Screen 2 — Product Quick View Modal

**Description:**
Clicking any product card opens a modal overlay (backdrop-blurred glass panel) displaying the full product image, name, category, description, weight, stock availability, rating (star display), price, and an "Add to Cart" button with quantity controls. This improves discoverability without leaving the main page.

---

### Screen 3 — Cart & Checkout Page

**URL:** `http://localhost:5000/pages/cart.html`

**Description:**
The cart page lists all added items with quantity +/- controls and individual item removal. The order summary panel on the right shows:
- Subtotal
- GST (5%)
- Delivery charge (Free above Rs 499)
- Promo code input with real-time discount application
- Grand Total

Below the summary, the customer selects a payment method (Cash, UPI, Google Pay, PhonePe, Paytm, Credit Card, Debit Card, Net Banking) and fills in the delivery address before placing the order.

---

### Screen 4 — Login & Signup Pages

**URL:** `http://localhost:5000/pages/login.html`

**Description:**
A minimal, centered glass-panel card with email/password fields and a submit button. A prominent "One-Click Owner Login" button pre-fills the admin credentials for quick demo access. The signup page captures name, email, and password.

---

### Screen 5 — Customer Profile & Order Tracking

**URL:** `http://localhost:5000/pages/profile.html`

**Description:**
The profile page shows the customer's avatar, name, reward points, and contact information. Below it, the **My Orders** section lists all past and active orders. Each order card can be expanded to reveal the **Live Tracking Timeline** — a vertical step-by-step progress tracker showing each milestone (Pending -> Preparing -> Baking -> Packed -> Out for Delivery -> Delivered) with timestamps and notes. A "Download Invoice (PDF)" button triggers the `/api/orders/:id/invoice` endpoint.

---

### Screen 6 — Admin Dashboard (Overview)

**URL:** `http://localhost:5000/pages/dashboard.html` *(admin role required)*

**Description:**
The admin dashboard opens to a set of **metric cards** arranged in a responsive grid:
- Today's Total Sales (Rs)
- Today's Orders Count
- Pending Orders (requires action)
- Total Customers
- Total Products
- Total Revenue (all time)
- Best Seller (product name)
- Monthly Income (Rs)

Below the cards, an **interactive SVG line chart** plots the last 7 days of order revenue with hover tooltips showing the daily figure.

---

### Screen 7 — Admin: Product Management

**Description:**
A searchable table/card grid lists all products with their image thumbnails, name, category, price, stock, and status (Enabled/Disabled). Inline edit fields allow the admin to update price and stock without navigating away. Each product row/card has:
- **Toggle Enable/Disable** switch (hides product from storefront)
- **Quick Price & Stock Edit** fields
- **Delete** button
- An **"Add New Product"** form panel where the admin can upload a photo or paste an image URL, set category, price, discount, weight, stock, and featured flags.

When the admin saves a product change, a Socket.IO `product_updated` event is immediately emitted and all customers browsing the storefront see the updated price/stock in real time.

---

### Screen 8 — Admin: Order Management

**Description:**
A full order list view sorted by newest first, with colour-coded status badges. For each order, the admin can:
- View itemised breakdown, customer contact, address, and payment method.
- Update the order status via a dropdown or quick-action button (Preparing -> Baking -> Packed -> Out for Delivery -> Delivered / Rejected).
- Each status click appends a timeline entry and emits `order_status_change` over Socket.IO directly to that customer's private room.

---

### Screen 9 — Admin: Offer & Promo Code Manager

**Description:**
A form allows the admin to create promotional offers with:
- **Code** (e.g., `SUMMER20`)
- **Discount Type** — Percentage (%) or Flat amount (Rs)
- **Discount Value**
- **Minimum Order Amount**
- **Maximum Uses** and expiry date
- **Festival/BOGO Deals** for seasonal campaigns

Active offers are displayed as cards on the storefront automatically.

---

### Screen 10 — PDF Tax Invoice

**Description:**
The downloaded invoice (A4 PDF via PDFKit) includes:
- Sweet Delight Bakery letterhead
- Invoice number, date, order number
- Customer name, address, phone, email
- Itemised table: Product Name | Qty | Unit Price | Discount | Line Total
- Subtotal, GST @ 5%, Delivery Charge, Promo Discount, **Grand Total**
- **Payment QR Code** (UPI string) for digital payment
- "Thank you for your order!" footer

---

---

## 8. Future Scope (Phase 2 Integration)

The current system establishes a strong foundation. The following enhancements are planned for **Phase 2**:

| Feature | Description |
|---|---|
| **Live Payment Gateway** | Integrate Razorpay or Stripe for real UPI/card transaction processing |
| **Email & SMS Notifications** | Nodemailer + Twilio for order confirmation and delivery alerts |
| **Push Notifications (PWA)** | Convert to a Progressive Web App with service workers for browser push alerts |
| **AI Demand Forecasting** | Use historical order data to predict busy periods and suggest restocking quantities |
| **Customer Reviews & Ratings** | Enable verified post-delivery ratings with image uploads (Review model already seeded) |
| **Loyalty & Rewards** | Automate reward point redemption during checkout (rewardPoints field already in User model) |
| **Multi-Branch Support** | Separate inventory and order queues per bakery branch |
| **Google Maps Delivery Tracking** | Embed live GPS tracking of delivery agent on the order tracking page |
| **Inventory Auto-Reorder Alerts** | Socket alert to admin when stock drops below a threshold |
| **Data Export** | Export sales reports as CSV/Excel from the admin dashboard |

---

---

## 9. Conclusion

The **Sweet Delight Bakery Management System** successfully demonstrates a complete, production-ready full-stack web application that solves real-world operational challenges faced by modern bakeries.

By combining **Node.js + Express.js** for the RESTful backend, **MongoDB with Mongoose** for flexible NoSQL data persistence, and **Socket.IO** for real-time bidirectional communication, the system delivers a seamless, live experience for both customers and the bakery owner.

The frontend leverages **Vanilla HTML5, CSS3 (Glassmorphism), and ES6 JavaScript** — without any heavy frontend framework — demonstrating mastery of core web technologies. The thoughtful UI/UX design with Dark/Light mode, micro-animations, responsive grids, and toast notifications ensures a premium, professional user experience.

Key academic learning outcomes achieved through this project:

1. **REST API Design** — Proper HTTP method usage, status codes, and JSON response conventions.
2. **Authentication & Security** — JWT-based stateless auth, bcrypt password hashing, role-based access control.
3. **Real-Time Web** — WebSocket architecture, Socket.IO room-based broadcasting.
4. **Database Design** — Relational-style normalisation within MongoDB's document model using Mongoose schemas.
5. **File Handling** — Multer-based image upload pipeline with static file serving.
6. **PDF Generation** — Server-side document creation with PDFKit and QR code embedding.
7. **Resilient Architecture** — Graceful fallback to in-memory store when the database is unavailable.

The project is a comprehensive demonstration of modern full-stack web development skills and is well-positioned for real-world deployment with the planned Phase 2 enhancements.

---

<div align="center">

*© 2026 Sweet Delight Bakery Management System — All Rights Reserved*
*Made with love for the WAD Subject Project*

</div>
