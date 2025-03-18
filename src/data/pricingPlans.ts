
// Plan types for the pricing/billing components
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

// Shared pricing plans data
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Basic access with limitations",
    features: [
      "500 calls only",
      "5 campaigns",
      "100 contacts per campaign",
      "Cannot modify contact lists once campaign starts",
      "View-only contact lists",
      "Community support",
      "No credit card required"
    ]
  },
  {
    id: "basic",
    name: "Basic",
    price: 49,
    description: "Perfect for individual users",
    features: [
      "5,000 calls",
      "5 campaigns",
      "1000 contacts per campaign",
      "View-only contact lists",
      "No editing of assigned campaign contacts",
      "Basic contact management",
      "Standard support"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    description: "Ideal for professionals and small teams",
    features: [
      "10,000 calls",
      "10 campaigns",
      "1000 contacts per campaign",
      "View-only contact lists",
      "Advanced contact management",
      "Priority support",
      "Team management features",
      "Custom branding options"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    description: "For organizations with advanced needs",
    features: [
      "Unlimited calls",
      "Unlimited campaigns",
      "Edit or change assigned contact lists",
      "Call recording & transcription",
      "Advanced analytics",
      "Enhanced security features",
      "Dedicated account manager",
      "24/7 premium support"
    ]
  }
];
