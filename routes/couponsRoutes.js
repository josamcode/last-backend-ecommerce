const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponControllers");

const { verifyToken, isAdmin } = require("../middlewares/auth");

// Protect all routes: only admin can access
router.use(verifyToken, isAdmin);

router.post("/", createCoupon); // Create
router.get("/", getAllCoupons); // Read all
router.get("/:id", getCouponById); // Read one
router.put("/:id", updateCoupon); // Update
router.delete("/:id", deleteCoupon); // Delete

module.exports = router;
