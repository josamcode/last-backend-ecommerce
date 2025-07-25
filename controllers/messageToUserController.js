const MessageToUser = require("../models/MessageToUser");
const User = require("../models/User");

// Admin: Send message to user
exports.createMessage = async (req, res) => {
  try {
    const { receiverId, content, type } = req.body;

    const message = await MessageToUser.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      type: type || "general",
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Send message to ALL users
exports.createMessageToAll = async (req, res) => {
  try {
    const { content, type } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Message content is required" 
      });
    }

    const users = await User.find({ role: { $ne: "admin" } }, "_id");
    
    if (!users || users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "No users found to send messages to" 
      });
    }

    // Create message records for each user
    const messages = users.map(user => ({
      sender: req.user.id,
      receiver: user._id,
      content: content.trim(),
      type: type || "general",
    }));

    // Insert all messages at once
    const createdMessages = await MessageToUser.insertMany(messages);

    res.status(201).json({ 
      success: true, 
      message: `Message sent to ${createdMessages.length} users`,
      count: createdMessages.length,
      messages: createdMessages 
    });
  } catch (err) {
    console.error("Error sending message to all users:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send message to all users",
      details: err.message 
    });
  }
};

// Admin: Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await MessageToUser.find()
      .populate("sender", "username role")
      .populate("receiver", "username")
      .sort({ createdAt: -1 });

    res.json({ success: true, length: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin + User: Get my messages
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await MessageToUser.find({ receiver: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin + User (who owns message): Get single message
exports.getMessageById = async (req, res) => {
  try {
    const message = await MessageToUser.findById(req.params.id);

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (
      req.user.role !== "admin" &&
      message.receiver.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized to view this message" });
    }

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ message: "messageIds is required and must be an array" });
  }

  try {
    // Only allow user to mark messages they received
    const result = await MessageToUser.updateMany(
      {
        _id: { $in: messageIds },
        receiver: req.user.id,
      },
      { isRead: true }
    );

    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// Admin: Update message
exports.updateMessage = async (req, res) => {
  try {
    const updated = await MessageToUser.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, type: req.body.type },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Message not found" });

    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await MessageToUser.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
