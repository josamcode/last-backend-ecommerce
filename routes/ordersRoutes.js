const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/auth");

const {
  createOrder,
  getOrders,
  updateShipping,
  updateOrderStatus,
  deleteOrder,
  applyCoupon,
  removeCouponFromOrders,
} = require("../controllers/ordersControllers");

router.get("/", verifyToken, getOrders);
router.post("/", verifyToken, createOrder);
router.put("/shipping/:id", verifyToken, updateShipping);
router.put("/status/:id", verifyToken, isAdmin, updateOrderStatus);
router.delete("/:id", verifyToken, isAdmin, deleteOrder);
router.post("/apply-coupon", verifyToken, applyCoupon);
router.delete("/remove-coupon", verifyToken, removeCouponFromOrders);

module.exports = router;
