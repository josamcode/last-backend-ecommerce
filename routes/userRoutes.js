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
  verifyEmail
} = require("../controllers/usersControllers");
const { verifyToken, isAdmin } = require("../middlewares/auth");

router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);
router.get("/auth/verify-email", verifyEmail);
router.get("/users", verifyToken, isAdmin, getUsers);
router.get("/me", verifyToken, getUser);
router.get("/user/:id", verifyToken, isAdmin, getUserById);
router.put("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, isAdmin, deleteUser);

module.exports = router;