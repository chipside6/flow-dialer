
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { pricingPlans } from "@/data/pricingPlans";

export const PricingSection = () => {
  return (
    <section className="py-4 md:py-6 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
            Simple, One-Time Payment
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Start with our free trial or get lifetime access with a one-time payment. No subscriptions or recurring fees.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-lg shadow-sm border border-border/70 bg-white overflow-hidden ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="bg-primary py-3 text-center text-white text-sm font-medium">
                  Best Value
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
                
                <div className="mt-6 mb-6 text-center">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <div className="flex justify-center">
                      <span className="text-4xl md:text-5xl lg:text-6xl font-bold">${plan.price}</span>
                    </div>
                  )}
                </div>
                
                <Link to={plan.price === 0 ? "/signup" : "/billing"}>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    {plan.price === 0 ? 'Start Free Trial' : 'Get Lifetime Access'}
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
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need help with setup?{' '}
            <a href="/contact" className="text-primary hover:underline">Contact our support team</a>.
          </p>
        </div>
      </div>
    </section>
  );
};
