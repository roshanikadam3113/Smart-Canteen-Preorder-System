const Order = require("../models/Order");

// @desc    Place a new order
// @route   POST /orders
// @access  Private (Student)
const placeOrder = async (req, res) => {
  try {
    const { userName, userEmail, rollNumber, department, items, totalAmount, slot, paymentMethod } = req.body;

    if (!userName || !userEmail || !rollNumber || !department || !items || !items.length || !totalAmount || !slot || !paymentMethod) {
      return res.status(400).json({ message: "Invalid order details" });
    }

    // Impersonation check: ensure logged-in user email matches the order email
    if (req.user.role !== "admin" && userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: "Access denied. You can only place orders under your own registered email." });
    }

    // Generate token number C-X (find last order to increment sequence)
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let nextSeq = 101;
    if (lastOrder && lastOrder.tokenNumber) {
      const match = lastOrder.tokenNumber.match(/C-(\d+)/);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
    const tokenNumber = `C-${nextSeq}`;

    const isPaid = ["gpay", "phonepe", "paytm", "bhim"].includes(paymentMethod.toLowerCase());

    const order = await Order.create({
      userName,
      userEmail: userEmail.toLowerCase(),
      rollNumber,
      department,
      items,
      totalAmount: Number(totalAmount),
      slot,
      paymentMethod,
      tokenNumber,
      status: "Preparing",
      isPaid,
    });

    // Notify admin room via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("new_order_placed", order);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders (Admin sees all, Student sees their own)
// @route   GET /orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};

    // IDOR Protection: Students can only retrieve their own orders
    if (req.user.role !== "admin") {
      query.userEmail = req.user.email.toLowerCase();
    } else if (email) {
      query.userEmail = email.toLowerCase();
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by token number
// @route   GET /orders/token/:tokenNumber
// @access  Private
const getOrderByToken = async (req, res) => {
  try {
    const { tokenNumber } = req.params;
    const order = await Order.findOne({ tokenNumber });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // IDOR Protection: Students can only view their own order details
    if (req.user.role !== "admin" && order.userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: "Access denied. You can only view your own orders." });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /orders/:id
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Notify student and admin room via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(updatedOrder.userEmail.toLowerCase()).emit("order_updated", updatedOrder);
      io.to("admin").emit("order_updated", updatedOrder);
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Archive completed orders
// @route   POST /orders/archive
// @access  Admin
const archiveReadyOrders = async (req, res) => {
  try {
    // Find all ready orders first so we can emit events for each
    const readyOrders = await Order.find({ status: "Ready" });

    const result = await Order.updateMany(
      { status: "Ready" },
      { $set: { status: "Completed" } }
    );

    // Notify students and admin room via Socket.io
    const io = req.app.get("io");
    if (io) {
      readyOrders.forEach((o) => {
        const updated = o.toObject ? o.toObject() : { ...o };
        updated.status = "Completed";
        io.to(updated.userEmail.toLowerCase()).emit("order_updated", updated);
        io.to("admin").emit("order_updated", updated);
      });
    }

    res.status(200).json({ message: "Ready orders marked as Completed", count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /orders/create-razorpay-order
// @access  Private (Student)
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === "your_razorpay_key_id") {
      return res.status(400).json({
        message: "Razorpay Key ID and Secret are not configured in backend .env file.",
      });
    }

    const Razorpay = require("razorpay");
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    res.status(200).json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ message: error.message || "Failed to create Razorpay order" });
  }
};

// @desc    Verify Razorpay Payment and save Order
// @route   POST /orders/verify-payment
// @access  Private (Student)
const verifyRazorpayPayment = async (req, res) => {
  try {
    const crypto = require("crypto");
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userName,
      userEmail,
      rollNumber,
      department,
      items,
      totalAmount,
      slot,
      paymentMethod,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userName ||
      !userEmail ||
      !rollNumber ||
      !department ||
      !items ||
      !items.length ||
      !totalAmount ||
      !slot
    ) {
      return res.status(400).json({ message: "Missing required order or payment details" });
    }

    // HMAC SHA256 Signature Verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    // Impersonation check: ensure logged-in user email matches the order email
    if (req.user.role !== "admin" && userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: "Access denied. Email mismatch." });
    }

    // Generate token number C-X
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let nextSeq = 101;
    if (lastOrder && lastOrder.tokenNumber) {
      const match = lastOrder.tokenNumber.match(/C-(\d+)/);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
    const tokenNumber = `C-${nextSeq}`;

    const order = await Order.create({
      userName,
      userEmail: userEmail.toLowerCase(),
      rollNumber,
      department,
      items,
      totalAmount: Number(totalAmount),
      slot,
      paymentMethod: paymentMethod || "Razorpay",
      tokenNumber,
      status: "Preparing",
      isPaid: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    // Socket broadcast
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("new_order_placed", order);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderByToken,
  updateOrderStatus,
  archiveReadyOrders,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
