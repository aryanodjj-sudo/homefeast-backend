// Server-side source of truth for subscription pricing. The controller
// looks prices up from here rather than trusting anything the client sends,
// so a tampered POST body can never buy a subscription at a fake price.
export const SUBSCRIPTION_PLANS = {
  monthly: { id: "monthly", label: "Monthly Plan", durationDays: 30, price: 2999 },
  yearly: { id: "yearly", label: "Yearly Plan", durationDays: 365, price: 29999 },
};

export default SUBSCRIPTION_PLANS;