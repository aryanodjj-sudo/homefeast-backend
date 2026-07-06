import Order from "../models/Order.js";

// Same format the frontend mock already generates, e.g. "HF-M3K2P1-482",
// kept so existing order ids in any test data still "look" the same.
const generateOrderCode = () =>
  `HF-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

const CANCELLABLE_STATUSES = ["Placed", "Confirmed", "Preparing"];

// GET /api/orders (protected - customer's own orders only)
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id (protected)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Customers may only view their own orders; admins may view any.
    if (req.user.role !== "admin" && String(order.userId) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// POST /api/orders (protected)
export const placeOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod, pricing, coupon } = req.body;

    if (!items?.length || !address || !paymentMethod || !pricing) {
      res.status(400);
      throw new Error("Missing required order details");
    }

    const order = await Order.create({
      orderCode: generateOrderCode(),
      userId: req.user._id,
      items,
      address,
      paymentMethod,
      pricing,
      coupon: coupon?.code || null,
      status: "Placed",
      statusHistory: [{ status: "Placed", at: new Date() }],
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/cancel (protected)
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (String(order.userId) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not authorized to cancel this order");
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      res.status(400);
      throw new Error(`Order cannot be cancelled once it is "${order.status}"`);
    }

    order.status = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", at: new Date() });
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders (admin only)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/orders/:id/status (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = status;
    order.statusHistory.push({ status, at: new Date() });
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};