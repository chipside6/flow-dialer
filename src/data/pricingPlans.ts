
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
}

// Shared pricing plans data
export const pricingPlans: PricingPlan[] = [
  {
    id: "trial",
    name: "3-Day Trial",
    price: 0,
    description: "Try all features",
    features: [
      "Unlimited calls during trial period",
      "Unlimited campaigns during trial",
      "Unlimited contacts",
      "Access to all premium features",
      "Automatically downgrades after 3 days"
    ],
    featuresObj: {
      maxCalls: 9999 // Unlimited for practical purposes
    },
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
    featuresObj: {
      maxCalls: 9999 // Unlimited for practical purposes
    },
    popular: true,
    isLifetime: true
  }
];
