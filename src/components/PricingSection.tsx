
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    price: 49,
    description: "Perfect for individual users",
    features: [
      "Unlimited calls within the network",
      "Up to 5 hours of external calls",
      "Basic contact management",
      "Core calling features",
      "Standard support"
    ]
  },
  {
    name: "Professional",
    price: 99,
    description: "Ideal for professionals and small teams",
    features: [
      "Unlimited calls",
      "Advanced contact management",
      "Call recording & transcription",
      "Priority support",
      "Team management features",
      "Custom branding options"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 149,
    description: "For organizations with advanced needs",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics",
      "Enhanced security features",
      "Service level agreement",
      "24/7 premium support"
    ]
  }
];

export const PricingSection = () => {
  return (
    <section className="py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works best for your communication needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`
                rounded-2xl p-8 border border-border/70 transition-all duration-300
                ${plan.popular 
                  ? 'bg-card shadow-lg relative scale-105 md:scale-110 z-10' 
                  : 'bg-card/50 hover:shadow-md'}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              
              <div className="mt-6 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <Link to="/billing">
                <Button 
                  className={`w-full rounded-full ${plan.popular ? '' : 'bg-primary/90 hover:bg-primary'}`}
                >
                  Get Started
                </Button>
              </Link>
              
              <div className="mt-8 space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for your specific requirements?{' '}
            <a href="/contact" className="text-primary hover:underline">Contact our sales team</a>.
          </p>
        </div>
      </div>
    </section>
  );
};
