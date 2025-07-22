const User = require("../models/User");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const { default: mongoose } = require("mongoose");

exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    const { id: productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let wishlist = await Wishlist.findById(user.wishlist);
    if (!wishlist) {
      wishlist = new Wishlist({ userId: user._id, items: [] });
    }

    const existing = wishlist.items.find(
      (i) => i.productId.toString() === productId
    );

    if (existing) {
      return res
        .status(400)
        .json({ message: "Product already exists in wishlist" });
    }

    wishlist.items.push({ productId });
    await wishlist.save();

    if (!user.wishlist) {
      user.wishlist = wishlist._id;
      await user.save();
    }

    await wishlist.populate("items.productId");

    res.json({ message: "Added to wishlist", wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const wishlist = await Wishlist.findById(user.wishlist)
      .populate("items.productId", "title price image")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message:
          "User not found. Please check the user ID or authentication token.",
      });
    }

    if (!user.wishlist) {
      return res.status(404).json({
        status: "empty",
        message: "Wishlist is empty. Add items to your wishlist to proceed.",
      });
    }

    if (!user.wishlist) {
      user.wishlist = wishlist._id;
      await user.save();
    }

    res.json({ length: wishlist.items.length, wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { id: productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const wishlist = await Wishlist.findById(user.wishlist);
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const initialLength = wishlist.items.length;

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    await wishlist.save();

    res.json({ message: "Removed from wishlist", wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const wishlist = await Wishlist.findById(user.wishlist);
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ message: "Wishlist cleared", wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
