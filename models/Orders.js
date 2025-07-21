const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        image: String,
        price: Number,
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
    shippingAddress: {
      fullName: String,
      phone: String,
      city: String,
      street: String,
      notes: String,
    },
    paymentMethod: {
      type: String,
      enum: ["CashOnDelivery", "Card", "PayPal"],
      default: "CashOnDelivery",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Format total
ordersSchema.pre("save", function (next) {
  if (this.total !== undefined && this.total !== null) {
    this.total = Number(this.total.toFixed(2));
  }
  next();
});

module.exports = mongoose.model("Order", ordersSchema);
