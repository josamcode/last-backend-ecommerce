
const WebsiteSettings = require("../models/websiteSettings");

// Create (once only)
exports.createSettings = async (req, res) => {
  try {
    const existing = await WebsiteSettings.findOne();
    if (existing) return res.status(400).json({ message: "Settings already exist" });

    const settings = new WebsiteSettings(req.body);
    await settings.save();
    res.status(201).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Read
exports.getSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne();
    if (!settings) return res.status(404).json({ message: "Settings not found" });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update
exports.updateSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne();
    if (!settings) return res.status(404).json({ message: "Settings not found" });

    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete
exports.deleteSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findOne();
    if (!settings) return res.status(404).json({ message: "Settings not found" });

    await WebsiteSettings.deleteOne({ _id: settings._id });
    res.json({ message: "Settings deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
