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
    });

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

    if (email) {
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
    const result = await Order.updateMany(
      { status: "Ready" },
      { $set: { status: "Completed" } }
    );
    res.status(200).json({ message: "Ready orders marked as Completed", count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderByToken,
  updateOrderStatus,
  archiveReadyOrders,
};
