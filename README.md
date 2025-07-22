# 🛍️ E-Commerce Backend API

This is a fully functional backend system for an e-commerce website, built using **Node.js**, **Express**, and **MongoDB** with **Mongoose** as the ODM. It includes support for products, users, carts, wishlists, orders, coupons, subscribers, and admin controls. It is designed to be scalable, secure, and production-ready with a focus on performance, modularity, and clean RESTful API principles.

---

## 📁 Project Structure

```
/backend
│
├── controllers/        # Logic for handling HTTP requests
├── models/             # MongoDB Mongoose models
├── routes/             # API route definitions
├── middlewares/        # Authentication, file upload, etc.
├── public/             # Static files (e.g., product images)
├── .env                # Environment variables
├── index.js            # Entry point
└── README.md           # This file
```

---

## 🔧 Features

### 🧑‍💼 User Management

- Register & Login with JWT authentication
- Profile management (update, delete)
- Role-based access (user, admin)

### 🛒 Cart System

- Add/remove products to cart
- Update product quantity
- Apply/remove coupons
- Calculate total dynamically

### 💝 Wishlist

- Add/remove products from wishlist
- View wishlist

### 📦 Orders

- Create order from cart
- Update shipping address
- Admin can update order status (pending, shipped, delivered, etc.)
- Apply coupons to orders

### 💸 Coupons

- Create, update, delete coupons
- Apply coupons to cart or orders
- Track users who used each coupon

### 📷 Products

- CRUD operations for products
- Upload multiple images
- Filter by category, brand, price range, pagination
- Get top-rated products

### 📨 Messaging System

- **User-to-Admin Messaging**: Customers can send messages to administrators
- **Admin-to-User Messaging**: Admins can send targeted messages to specific users
- **Notification Center**: Users can view their received messages
- **Read/Unread Status**: Messages track whether they've been read
- **Message Types**: Support for notifications, warnings, replies, and general messages
- **Bulk Mark as Read**: Users can mark multiple messages as read at once

### 📢 Subscriber Management

- Users can subscribe with their email
- Admins can view and manage subscribers
- Prevents duplicate subscriptions

### 🛠️ Admin Features

- Manage products, coupons, settings
- Full control over orders
- View and respond to user messages
- Manage subscriber list
- View all users

### 🌐 Website Settings

- Manage site-wide settings (logo, colors, contact info, etc.)
- Configure social media links
- Set site name, tagline, and description
- Update about us content

---

## 📦 Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Bcrypt** for password encryption
- **Multer** for image uploads
- **Dotenv** for environment variables
- **CORS** for cross-origin requests

---

## 🧪 API Endpoints

### 🔐 Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/me` - Get current user (requires token)

### 🛍️ Products

- `GET /api/products` - List all products
- `GET /api/products/categories` - Get available categories
- `GET /api/products/brands` - Get available brands
- `GET /api/products/top-rated` - Get top-rated products
- `GET /api/products/search` - Search products by keyword
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### 🔍 Product Filters Examples

```
// GET /api/products?category=men&brand=Nike&maxPrice=1000
// GET /api/products?category=women&minPrice=200&maxPrice=500
// GET /api/products?brand=Adidas&limit=5&page=1
// GET /api/products?page=2&limit=5
// GET /api/products?discounted=true
// GET /api/products/categories
// GET /api/products/brands
```

... (Rest of the endpoints remain unchanged for brevity)
