const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

const {
  addToCart,
  removeFromCart,
  updateProductQuantity,
  clearCart,
  getCart,
  applyCoupon,
  removeCouponFromCart,
} = require("../controllers/cartControllers");

router.get("/", verifyToken, getCart);
router.post("/add/:id", verifyToken, addToCart);
router.delete("/remove/:id", verifyToken, removeFromCart);
router.put("/update/:id", verifyToken, updateProductQuantity);
router.delete("/clear", verifyToken, clearCart);
// router.post("/apply-coupon", verifyToken, applyCoupon);
// router.delete("/remove-coupon", verifyToken, removeCouponFromCart);

module.exports = router;
