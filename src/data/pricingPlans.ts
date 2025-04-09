
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
    id: "free",
    name: "Free",
    price: 0,
    description: "Basic access",
    features: [
      "Limited to 100 calls daily",
      "Limited to 1,000 calls monthly",
      "Basic features"
    ],
    featuresObj: {
      maxDailyCalls: 100,
      maxMonthlyCalls: 1000,
      maxCalls: 1000
    },
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
    featuresObj: {
      maxCalls: 9999 // Unlimited for practical purposes
    },
    popular: true,
    isLifetime: true,
    trialDays: 0 // No trial for lifetime plan
  }
];
