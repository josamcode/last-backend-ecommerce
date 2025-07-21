const express = require("express");
const router = express.Router();

const {
  createUser,
  getUser,
  loginUser,
  updateUser,
  deleteUser,
  addToCart,
  removeFromCart,
  updateProductQuantity,
  clearCart,
} = require("../controllers/usersControllers");
const { verifyToken } = require("../middlewares/auth");

// User routes
router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);
router.get("/me", verifyToken, getUser);
router.put("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, deleteUser);

module.exports = router;
