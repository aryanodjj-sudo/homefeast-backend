import Subscription from "../models/Subscription.js";

// Applied to POST /api/orders (before it reaches the order controller).
// If the placing customer has an active, not-yet-expired subscription,
// this overrides whatever pricing.total the client sent to 0 - so the
// discount is enforced server-side and can't be bypassed by a tampered
// request. orderController.js itself never needs to change; it just
// receives an already-zeroed pricing object like normal.
export const applySubscriptionDiscount = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: "Active",
      endDate: { $gte: new Date() },
    });

    if (subscription && req.body.pricing) {
      const original = req.body.pricing;
      const subtotal = Number(original.subtotal) || 0;
      const shipping = Number(original.shipping) || 0;
      const tax = Number(original.tax) || 0;

      req.body.pricing = {
        ...original,
        discount: subtotal + shipping + tax,
        total: 0,
      };
      req.body.isSubscriptionOrder = true;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default applySubscriptionDiscount;