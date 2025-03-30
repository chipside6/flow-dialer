
// Plan types for the pricing/billing components
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  isTrial?: boolean;
  isLifetime?: boolean;
}

// Shared pricing plans data
export const pricingPlans: PricingPlan[] = [
  {
    id: "trial",
    name: "3-Day Trial",
    price: 0,
    description: "Full access for 3 days",
    features: [
      "Full feature access for 3 days",
      "Unlimited calls during trial period",
      "Unlimited campaigns during trial",
      "Unlimited contacts",
      "Access to all premium features",
      "Automatically downgrades after 3 days"
    ],
    isTrial: true
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
