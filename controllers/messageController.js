const Message = require("../models/Message");
const User = require("../models/User");

exports.createMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (trimmedMessage.length < 6) {
      return res.status(400).json({ message: "Your Message is too short!" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = new Message({
      userId: user._id,
      username: user.username,
      message: trimmedMessage,
      phone: user.phone,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Server error while saving message" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    res.status(500).json({ message: "Server error while deleting message" });
  }
};
