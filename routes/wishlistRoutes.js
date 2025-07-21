const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistControllers");

router.post("/add/:id", verifyToken, addToWishlist);
router.get("/", verifyToken, getWishlist);
router.delete("/remove/:id", verifyToken, removeFromWishlist);
router.delete("/clear", verifyToken, clearWishlist);

module.exports = router;
