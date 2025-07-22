const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");

async function calculateCartTotal(cart) {
  let sum = 0;
  for (const item of cart.items) {
    const prod = await Product.findById(item.productId).select("price");
    if (prod) sum += prod.price * item.quantity;
  }
  return sum;
}

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "cart",
      populate: {
        path: "items.productId",
        select: "title price image",
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message:
          "User not found. Please check the user ID or authentication token.",
      });
    }

    if (!user.cart) {
      return res.status(404).json({
        status: "empty",
        message: "Cart is empty. Add items to your cart to proceed.",
      });
    }

    res.json({ length: user.cart.items.length, cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart");
    const { quantity = 1, color = null, size = null } = req.body || {};
    const { id: productId } = req.params;

    let cart = await Cart.findById(user.cart);
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    const existing = cart.items.find(
      (i) =>
        i.productId.toString() === productId &&
        i.color === color &&
        i.size === size
    );

    if (quantity > 0) {
      if (existing) {
        return res
          .status(400)
          .json({ message: "Product already exists in cart" });
      } else {
        cart.items.push({ productId, quantity, color, size });
      }
    } else {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    cart.total = await calculateCartTotal(cart);
    await cart.save();

    if (!user.cart) {
      user.cart = cart._id;
      await user.save();
    }

    res.json({ success: true, message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { color = null, size = null } = req.body || {};
    const { id: productId } = req.params;

    const user = await User.findById(req.user.id);
    const cart = await Cart.findById(user.cart);

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.productId.toString() === productId &&
          i.color === color &&
          i.size === size
        )
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.total = await calculateCartTotal(cart);
    await cart.save();

    res.json({ message: "Removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProductQuantity = async (req, res) => {
  try {
    const { quantity, color = null, size = null } = req.body || {};
    const { id: productId } = req.params;

    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const user = await User.findById(req.user.id);
    const cart = await Cart.findById(user.cart);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) =>
        i.productId.toString() === productId &&
        i.color === color &&
        i.size === size
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    cart.total = await calculateCartTotal(cart);
    await cart.save();

    res.json({ message: "Quantity updated", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const cart = await Cart.findById(user.cart);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.couponCode = null;
    cart.total = 0;
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};