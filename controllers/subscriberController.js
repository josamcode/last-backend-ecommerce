const Subscriber = require("../models/Subscriber");

// POST /api/subscribers
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existing = await Subscriber.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already subscribed" });

    const subscriber = await Subscriber.create({ email });
    res.status(201).json({ success: true, subscriber });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.status(200).json({ success: true, subscribers });
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
