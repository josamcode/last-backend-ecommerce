const express = require("express");
const router = express.Router();

const {
  createUser,
  getUser,
  loginUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
} = require("../controllers/usersControllers");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// User routes
router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);
router.get("/users", verifyToken, isAdmin, getUsers);
router.get("/me", verifyToken, getUser);
router.get("/user/:id", verifyToken, isAdmin, getUserById);
router.put("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, isAdmin, deleteUser);

module.exports = router;
