const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Basic product info
    title: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    // Discount details
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"], // Fixed amount or percentage
      default: "fixed",
    },

    // Multiple categories allowed (e.g. ["men", "shirts"])
    category: {
      type: [String],
      default: [],
    },

    // Product variations
    sizes: {
      type: [String], // e.g. ["S", "M", "L", "XL"]
      default: [],
    },
    colors: {
      type: [String], // e.g. ["red", "blue", "black"]
      default: [],
    },

    // Tags for filtering/searching (SEO)
    tags: {
      type: [String], // e.g. ["summer", "cotton", "casual"]
      default: [],
    },

    // Image URLs or filenames
    images: {
      type: [String],
      default: [],
    },

    // Inventory control
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number, // Useful for quantity-based stock tracking
      default: 0,
    },

    // Brand or manufacturer
    brand: {
      type: String,
      default: "Generic",
    },

    // Rating system
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // Product visibility (can hide without deleting)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
