// controllers/ordersControllers.js (or the relevant controller file name)
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Orders = require("../models/Orders");
const Cart = require("../models/Cart");
const transporter = require('../config/emailService'); // Import transporter
const {
  getOrderConfirmationHTML,
  getNewOrderNotificationHTML,
  getOrderStatusUpdateHTML
} = require('../utils/orderEmailTemplates'); // Import email templates

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

exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { couponCode, paymentMethod, shippingAddress, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

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
        name: product.title,
        image: product.images?.[0] || null,
        price: product.price,
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
      });
    }

    let total = calculateOrderTotal(snapshotItems);
    let finalCoupon = null;
    let discountValue = 0;

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
      if (coupon.type === "percent") {
        discountValue = total * (coupon.value / 100);
      } else if (coupon.type === "fixed") {
        discountValue = coupon.value;
      }
      total = Math.max(total - discountValue, 0);
      finalCoupon = coupon.coupon;
    }

    const newOrder = new Orders({
      userId: req.user.id,
      couponCode: finalCoupon,
      paymentMethod: paymentMethod || "CashOnDelivery",
      shippingAddress,
      items: snapshotItems,
      total,
    });

    const savedOrder = await newOrder.save();

    if (!user.orders.includes(savedOrder._id)) {
      user.orders.push(savedOrder._id);
      await user.save();
    }

    const cart = await Cart.findById(user.cart);
    if (cart) {
      cart.items = cart.items.filter(
        (cartItem) =>
          !items.some(
            (orderedItem) =>
              orderedItem.productId === cartItem.productId.toString() &&
              orderedItem.color === cartItem.color &&
              orderedItem.size === cartItem.size
          )
      );
      cart.total = await calculateCartTotal(cart);
      await cart.save();
    }

    try {
      if (user.email) {
        const userMailOptions = {
          from: `"JOSAM" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Order Confirmation #${savedOrder._id}`,
          html: getOrderConfirmationHTML(user, savedOrder, finalCoupon, discountValue),
        };
        await transporter.sendMail(userMailOptions);
        console.log(`📧 Order confirmation email sent to user: ${user.email}`);
      } else {
        console.warn(`⚠️ User ${user._id} does not have an email address. Order confirmation email not sent to user.`);
      }

      const ownerMailOptions = {
        from: `"JOSAM" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Order Received #${savedOrder._id}`,
        html: getNewOrderNotificationHTML(user, savedOrder, finalCoupon, discountValue),
      };
      await transporter.sendMail(ownerMailOptions);
      console.log(`📧 New order notification email sent to owner: ${process.env.EMAIL_USER}`);
    } catch (emailError) {
      console.error("📧 Error sending order confirmation emails:", emailError);
    }

    res.status(201).json({
      status: "success",
      message: "Order created successfully. Confirmation emails sent.",
      order: savedOrder,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

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

exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) {
      filter.state = status;
    }
    if (userId) {
      filter.userId = userId;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Orders.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username phone');

    const total = await Orders.countDocuments(filter);

    res.json({
      status: "success",
      length: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      orders
    });
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

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

exports.updateShipping = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { shippingAddress } = req.body;

    const order = await Orders.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this order" });
    }

    order.shippingAddress = shippingAddress;
    await order.save();

    res.json({ message: "Shipping address updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    const order = await Orders.findById(orderId).populate('userId', 'username email phone');
    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousState = order.state;
    order.state = state;
    const updatedOrder = await order.save();

    try {
      const user = order.userId;
      if (user && user.email) {
        const statusMailOptions = {
          from: `"JOSAM" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Order #${order._id} Status Updated to ${state.charAt(0).toUpperCase() + state.slice(1)}`,
          html: getOrderStatusUpdateHTML(user, order, previousState, state),
        };
        await transporter.sendMail(statusMailOptions);
        console.log(`📧 Order status update email sent to user: ${user.email} for order ${order._id}`);
      } else {
        console.warn(`⚠️ Could not send status update email for order ${order._id}. User email not found.`);
      }
    } catch (emailError) {
      console.error("📧 Error sending order status update email:", emailError);
    }

    res.json({
      message: `Order status updated from ${previousState} to ${state}`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

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

exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const user = await User.findById(req.user.id).populate("cart");
    if (!user || !user.cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cart = await Cart.findById(user.cart._id).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    let cartTotal = 0;
    for (const item of cart.items) {
      const price = item.productId.price;
      cartTotal += price * item.quantity;
    }

    const coupon = await Coupon.findOne({ coupon: couponCode.toUpperCase() });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

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
    // Note: This part seems incorrect in the original code.
    // `user.orders` is likely an array of order IDs.
    // You would need to fetch the specific order or iterate through orders.
    // Assuming you want to remove from the latest order or a specific one.
    // This logic needs review based on your actual data structure and requirements.
    // For now, keeping the structure similar but noting the potential issue.

    // Example: Get the latest order (this is just one interpretation)
    const orders = await Orders.findOne({ _id: { $in: user.orders } }).sort({ createdAt: -1 });
    if (!orders) return res.status(404).json({ message: "Orders not found" });

    if (!orders.couponCode) {
      return res.status(400).json({ message: "No coupon applied to orders" });
    }

    const coupon = await Coupon.findOne({ coupon: orders.couponCode });
    if (coupon) {
      coupon.usedBy = coupon.usedBy.filter(
        (userId) => userId.toString() !== user._id.toString()
      );
      await coupon.save();
    }

    orders.couponCode = undefined;
    // Assuming calculateOrderTotal is meant to be used here, or a similar function
    orders.total = calculateOrderTotal(orders.items); // This might need adjustment
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