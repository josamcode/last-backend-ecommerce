const express = require("express");
const router = express.Router();
const {
  addSubscriber,
  getAllSubscribers,
  deleteSubscriber,
} = require("../controllers/subscriberController");
const { verifyToken, isAdmin } = require("../middlewares/auth");


// Public - Add new subscriber
router.post("/", verifyToken, addSubscriber);

// Admin only
router.get("/", verifyToken, isAdmin, getAllSubscribers);
router.delete("/:id", verifyToken, isAdmin, deleteSubscriber);

module.exports = router;
