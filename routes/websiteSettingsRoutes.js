const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/auth");
const {
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings,
} = require("../controllers/websiteSettingsControllers");

// Anyone (even public users) can view settings
router.get("/", getSettings);

// Only admins can Create, Update, or Delete
router.post("/", verifyToken, isAdmin, createSettings);
router.put("/", verifyToken, isAdmin, updateSettings);
router.delete("/", verifyToken, isAdmin, deleteSettings);

module.exports = router;
