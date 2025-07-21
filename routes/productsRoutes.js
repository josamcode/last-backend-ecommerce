const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/auth");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getTopRatedProducts,
} = require("../controllers/productsControllers");
const upload = require("../middlewares/upload");

// CREATE Product - Admin Only
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.array("images", 5),
  createProduct
);

// GET categories first
router.get("/categories", getCategories);

// GET all products
router.get("/", getProducts);

// Get top rated products
router.get("/top-rated", getTopRatedProducts);

// then GET product by id
router.get("/:id", getProduct);

// UPDATE Product - Admin Only
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      req.product = product;
      next();
    } catch (err) {
      return res.status(500).json({ message: "Failed to load product" });
    }
  },
  upload.array("images", 5),
  updateProduct
);

// DELETE Product - Admin Only
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
