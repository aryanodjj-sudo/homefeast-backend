import Subscription from "../models/Subscription.js";
import SUBSCRIPTION_PLANS from "../utils/subscriptionPlans.js";

// POST /api/subscriptions (protected - customer)
export const createSubscription = async (req, res, next) => {
  try {
    const { plan, mealPreference, address, paymentMethod } = req.body;

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) {
      res.status(400);
      throw new Error("Invalid subscription plan");
    }

    if (!address || !paymentMethod) {
      res.status(400);
      throw new Error("Delivery address and payment method are required");
    }

    // Prevent stacking a second active subscription - keeps "who currently
    // has a subscription" unambiguous for both the customer and admin.
    const existingActive = await Subscription.findOne({
      userId: req.user._id,
      status: "Active",
    });
    if (existingActive) {
      res.status(400);
      throw new Error("You already have an active subscription");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planConfig.durationDays);

    const subscription = await Subscription.create({
      userId: req.user._id,
      plan,
      mealPreference: mealPreference || "veg",
      address,
      paymentMethod,
      price: planConfig.price,
      startDate,
      endDate,
      status: "Active",
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/my (protected - customer's own subscriptions)
export const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/subscriptions/:id/cancel (protected - customer cancels own)
export const cancelMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    subscription.status = "Cancelled";
    const updated = await subscription.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// --- Admin only --------------------------------------------------------

// GET /api/admin/subscriptions
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/subscriptions/:id
export const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["Active", "Paused", "Cancelled", "Expired"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    subscription.status = status;
    const updated = await subscription.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};