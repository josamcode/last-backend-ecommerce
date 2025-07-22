const express = require("express");
const router = express.Router();

const {
  createMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/messageController");

const { verifyToken, isAdmin } = require("../middlewares/auth");

// @POST Create a new message (User only)
router.post("/", verifyToken, createMessage);

// @GET All messages (Admin only)
router.get("/", verifyToken, isAdmin, getMessages);

// @DELETE Message by ID (Admin only)
router.delete("/:id", verifyToken, isAdmin, deleteMessage);

module.exports = router;