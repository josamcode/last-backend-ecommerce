// Orders Controller (Refactored)
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Orders = require("../models/Orders");
const Cart = require("../models/Cart");

// Helper to calculate total from snapshot items
function calculateOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

async function calculateCartTotal(cart) {
  let sum = 0;
  for (const item of cart.items) {
    const prod = await Product.findById(item.productId).select("price");
    if (prod) sum += prod.price * item.quantity;
  }
  return sum;
}

// Create New Order
// In createOrder controller
exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { couponCode, paymentMethod, shippingAddress, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "No items in order" });

    const snapshotItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          productId: item.productId,
        });
      }
      snapshotItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || null,
        price: product.price,
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
      });
    }

    let total = calculateOrderTotal(snapshotItems);
    let finalCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ coupon: couponCode.toUpperCase() });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Coupon has expired" });
      }
      if (total < coupon.minCartValue) {
        return res.status(400).json({
          message: `Coupon requires minimum cart value of ${coupon.minCartValue} EGP`,
        });
      }
      if (coupon.usedBy.includes(user._id)) {
        return res.status(400).json({ message: "Coupon already used by you" });
      }

      let discount = 0;
      if (coupon.type === "percent") {
        discount = total * (coupon.value / 100);
      } else if (coupon.type === "fixed") {
        discount = coupon.value;
      }
      total = Math.max(total - discount, 0);
      finalCoupon = coupon.coupon;

      // Mark coupon as used
      coupon.usedBy.push(user._id);
      await coupon.save();
    }

    const newOrder = new Orders({
      userId: req.user.id,
      couponCode: finalCoupon,
      paymentMethod: paymentMethod || "CashOnDelivery",
      shippingAddress,
      items: snapshotItems,
      total,
    });

    await newOrder.save();

    if (!user.orders.includes(newOrder._id)) {
      user.orders.push(newOrder._id);
      await user.save();
    }

    // Remove items from cart
    const cart = await Cart.findById(user.cart);
    if (cart) {
      cart.items = cart.items.filter(
        (cartItem) =>
          !items.some(
            (item) =>
              item.productId === cartItem.productId.toString() &&
              item.color === cartItem.color &&
              item.size === cartItem.size
          )
      );
      cart.total = await calculateCartTotal(cart);
      await cart.save();
    }

    res.status(201).json({
      status: "success",
      message: "Order created",
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Orders of Authenticated User
exports.getOrders = async (req, res) => {
  try {
    const orders = await Orders.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    if (!orders.length) {
      return res
        .status(404)
        .json({ status: "empty", message: "You have no orders yet." });
    }
    res.json({ status: "success", length: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Orders.findOne({
      _id: orderId
    });

    if (!order) {
      return res
        .status(404)
        .json({ status: "not_found", message: "Order not found." });
    }

    res.json({
      status: "success",
      length: 1,
      order: [order],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update Shipping Address (User only)
exports.updateShipping = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { shippingAddress } = req.body;
    const order = await Orders.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this order" });

    order.shippingAddress = shippingAddress;
    await order.save();

    res.json({ message: "Shipping address updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const state = req.body.state?.toLowerCase();

    const allowedStates = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!state || !allowedStates.includes(state)) {
      return res.status(400).json({ message: "Invalid order state" });
    }

    const order = await Orders.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.state = state;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Prevent users from deleting orders
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Orders.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    await User.findByIdAndUpdate(order.userId, {
      $pull: { orders: order._id },
    });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/orderController.js

exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode)
      return res.status(400).json({ message: "Coupon code is required" });

    const user = await User.findById(req.user.id).populate("cart");
    if (!user || !user.cart)
      return res.status(404).json({ message: "Cart not found" });

    const cart = await Cart.findById(user.cart._id).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    // Calculate cart total
    let cartTotal = 0;
    for (const item of cart.items) {
      const price = item.productId.price;
      cartTotal += price * item.quantity;
    }

    // Find coupon
    const coupon = await Coupon.findOne({ coupon: couponCode.toUpperCase() });
    if (!coupon)
      return res.status(400).json({ message: "Invalid coupon code" });

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (cartTotal < coupon.minCartValue) {
      return res.status(400).json({
        message: `Coupon requires minimum cart value of ${coupon.minCartValue} EGP`,
      });
    }

    if (coupon.usedBy.includes(user._id)) {
      return res.status(400).json({ message: "Coupon already used by you" });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percent") {
      discount = cartTotal * (coupon.value / 100);
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
    }

    const totalAfterDiscount = Math.max(cartTotal - discount, 0);

    const discountValue = Math.round(discount * 100) / 100;
    const totalAfter = Math.round(totalAfterDiscount * 100) / 100;

    res.status(200).json({
      message: "Coupon applied successfully",
      discount: discountValue,
      totalAfterDiscount: totalAfter,
    });
  } catch (err) {
    console.error("Error applying coupon:", err);
    return res.status(500).json({
      message: "Failed to apply coupon",
      error: err.message,
    });
  }
};

exports.removeCouponFromOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const orders = await Orders.findById(user.orders);
    if (!orders) return res.status(404).json({ message: "Orders not found" });

    if (!orders.couponCode) {
      return res.status(400).json({ message: "No coupon applied to orders" });
    }

    const coupon = await Coupon.findOne({ coupon: orders.couponCode });
    if (coupon) {
      // Remove user from usedBy
      coupon.usedBy = coupon.usedBy.filter(
        (userId) => userId.toString() !== user._id.toString()
      );
      await coupon.save();
    }

    // Remove coupon from orders
    orders.couponCode = undefined;
    orders.total = await calculateOrdersTotal(orders);
    await orders.save();

    res.status(200).json({
      message: "Coupon removed successfully",
      orders,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to remove coupon",
      error: err.message,
    });
  }
};
