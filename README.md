---
# 🛍️ E-Commerce Backend API

This is a fully functional backend system for an e-commerce website, built using **Node.js**, **Express**, and **MongoDB** with **Mongoose** as the ODM. It includes support for products, users, carts, wishlists, orders, coupons, and admin controls.
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
- Filter by category, brand, price range
- Get top-rated products

### 🛠️ Admin Features

- Manage products, coupons, settings
- Full control over orders

### 🌐 Website Settings

- Manage site-wide settings (logo, colors, contact info, etc.)

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
- `GET /api/products/top-rated` - Get top-rated products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### 🛒 Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart/add/:id` - Add product to cart
- `DELETE /api/cart/remove/:id` - Remove product from cart
- `PUT /api/cart/update/:id` - Update product quantity
- `DELETE /api/cart/clear` - Clear cart

### 💝 Wishlist

- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add/:id` - Add product to wishlist
- `DELETE /api/wishlist/remove/:id` - Remove product from wishlist
- `DELETE /api/wishlist/clear` - Clear wishlist

### 📦 Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/shipping/:id` - Update shipping address
- `PUT /api/orders/status/:id` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

### 💸 Coupons

- `GET /api/coupons` - Get all coupons
- `GET /api/coupons/:id` - Get coupon by ID
- `POST /api/coupons` - Create coupon (admin only)
- `PUT /api/coupons/:id` - Update coupon (admin only)
- `DELETE /api/coupons/:id` - Delete coupon (admin only)

### 🌐 Website Settings

- `GET /api/website-settings` - Get site settings
- `POST /api/website-settings` - Create settings (admin only)
- `PUT /api/website-settings` - Update settings (admin only)
- `DELETE /api/website-settings` - Delete settings (admin only)

---

## 📝 Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce
JWT_SECRET=your_jwt_secret_key
```

---

## 🚀 Running the Project

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will run on `http://localhost:5000`.

---

## 📸 Public Folder

All uploaded product images are stored in the `public/images/products` folder.

---

## 📜 License

This project is licensed under the MIT License.

---

## 🧑‍💻 Developed By

[Gerges Samuel @josamcode]  
Frontend & Backend Developer

---

> 💡 Tip: You can expand this backend with payment gateway integration (e.g., Stripe, PayPal), search & filtering enhancements, and caching (e.g., Redis) for better performance.

---
