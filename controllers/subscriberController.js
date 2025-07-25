const Subscriber = require("../models/Subscriber");
const User = require("../models/User");

// POST /api/subscribers
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingByUser = await Subscriber.findOne({ userId });
    if (existingByUser)
      return res.status(409).json({ message: "User already has a subscribed email" });

    const existingByEmail = await Subscriber.findOne({ email });
    if (existingByEmail)
      return res.status(409).json({ message: "Email already subscribed" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const subscriber = await Subscriber.create({
      email,
      userId,
      username: user.username,
      phone: user.phone,
    });

    res.status(201).json({ success: true, subscriber });
  } catch (err) {
    console.error("AddSubscriber Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// GET /api/subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.status(200).json({ success: true, length: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/subscribers/:id
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber)
      return res.status(404).json({ message: "Subscriber not found" });

    res.status(200).json({ success: true, message: "Subscriber deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
