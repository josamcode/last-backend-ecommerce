const MessageToUser = require("../models/MessageToUser");

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

// Admin: Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await MessageToUser.find()
      .populate("sender", "username role")
      .populate("receiver", "username")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
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
