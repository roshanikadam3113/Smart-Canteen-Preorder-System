const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getOrders,
  getOrderByToken,
  updateOrderStatus,
  archiveReadyOrders,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/orderController");

router.post("/", protect, placeOrder);
router.post("/create-razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyRazorpayPayment);
router.get("/", protect, getOrders);
router.get("/token/:tokenNumber", protect, getOrderByToken);
router.put("/:id", protect, adminOnly, updateOrderStatus);
router.post("/archive", protect, adminOnly, archiveReadyOrders);

module.exports = router;

  