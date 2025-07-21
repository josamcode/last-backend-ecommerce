// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  coupon: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ["percent", "fixed"],
    default: "percent",
  },
  value: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  minCartValue: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
