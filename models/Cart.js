const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    total: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: {
          type: String,
          default: null,
        },
        size: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  if (this.total !== undefined && this.total !== null) {
    this.total = Number(this.total.toFixed(2));
  }
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
