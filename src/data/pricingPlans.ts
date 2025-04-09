
// Plan types for the pricing/billing components
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  featuresObj?: {
    maxCalls: number;
    [key: string]: any;
  };
  popular?: boolean;
  isTrial?: boolean;
  isLifetime?: boolean;
  isFree?: boolean;
  trialDays?: number;
}

// Shared pricing plans data
export const pricingPlans: PricingPlan[] = [
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
    featuresObj: {
      maxCalls: 9999 // Unlimited for practical purposes
    },
    popular: true,
    isLifetime: true,
    trialDays: 0 // No trial for lifetime plan
  }
];
