const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: Array,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    slot: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    tokenNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Preparing", "Cooking", "Ready", "Completed", "Cancelled"],
      default: "Preparing",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;