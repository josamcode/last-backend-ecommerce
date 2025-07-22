const express = require("express");
const {
  createMessage,
  getAllMessages,
  getMyMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  markMessagesAsRead,
} = require("../controllers/messageToUserController.js");
const { verifyToken, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Admin: create message
router.post("/", verifyToken, isAdmin, createMessage);

// Admin: get all messages
router.get("/", verifyToken, isAdmin, getAllMessages);

// Admin + user: get my messages
router.get("/my", verifyToken, getMyMessages);

// Admin + user (owner): get one message
router.get("/:id", verifyToken, getMessageById);

router.put("/mark-read", verifyToken, markMessagesAsRead);

// Admin: update message
router.put("/edit/:id", verifyToken, isAdmin, updateMessage);

// Admin: delete message
router.delete("/:id", verifyToken, isAdmin, deleteMessage);


module.exports = router;
