
// Plan types for the pricing/billing components
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  isFree?: boolean;
  isLifetime?: boolean;
}

// Shared pricing plans data
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Basic access with limitations",
    features: [
      "500 calls monthly limit",
      "Limited campaigns",
      "500 contacts per campaign",
      "Cannot modify contact lists once campaign starts",
      "View-only contact lists",
      "Community support"
    ],
    isFree: true
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: 199,
    description: "One-time payment for unlimited access",
    features: [
      "Unlimited calls",
      "Unlimited campaigns",
      "Advanced analytics",
      "Priority support",
      "Custom branding options",
      "Pay once, use forever"
    ],
    popular: true,
    isLifetime: true
  }
];
