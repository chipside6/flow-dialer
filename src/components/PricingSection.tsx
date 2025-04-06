
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { pricingPlans } from "@/data/pricingPlans";

export const PricingSection = () => {
  return (
    <section className="py-8 md:py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
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
                <h3 className="text-2xl font-bold text-center mb-3">{plan.name}</h3>
                <p className="text-muted-foreground text-center mb-6">{plan.description}</p>
                
                <div className="space-y-5 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <Circle className="h-5 w-5 text-primary/50 flex-shrink-0" fill="#e6f7ff" strokeWidth={0} />
                      <span className="text-base text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 mb-6 text-center">
                  {plan.price === 0 ? (
                    <span className="text-5xl font-bold">Free</span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary">${plan.price}</span>
                      {!plan.isLifetime && (
                        <span className="text-xl text-primary/70 mt-2">per month{plan.featuresObj?.maxCalls ? `, per channel` : ''}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <Link to={plan.price === 0 ? "/signup" : "/billing"}>
                  <Button 
                    className="w-full rounded-full py-6 text-lg"
                    variant={plan.isTrial ? "orange" : "default"}
                  >
                    {plan.price === 0 ? 'Start Free Trial' : 'Get Lifetime Access'}
                  </Button>
                </Link>
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
