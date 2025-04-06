
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";
import { Circle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UpgradePlanSection = () => {
  const { currentPlan, activateLifetimePlan, isLoading } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter to only show plans that are upgrades (higher price than current plan)
  const getUpgradePlans = () => {
    if (!currentPlan) return pricingPlans;
    
    const currentPlanData = pricingPlans.find(plan => plan.id === currentPlan);
    if (!currentPlanData) return pricingPlans;
    
    return pricingPlans.filter(plan => plan.price > currentPlanData.price);
  };

  const upgradePlans = getUpgradePlans();

  const handleUpgrade = async (plan: PricingPlan) => {
    setProcessingPlan(plan.id);
    const result = await activateLifetimePlan();
    setProcessingPlan(null);
    
    if (result.success) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p>Loading subscription data...</p>
      </div>
    );
  }

  if (upgradePlans.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">You're on our top plan!</h3>
        <p className="text-muted-foreground">
          You're already subscribed to our highest tier plan. Thank you for your support!
        </p>
      </div>
    );
  }

  return (
    <div id="upgrade-plans" className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Upgrade Your Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upgradePlans.map((plan) => (
          <div
            key={plan.id}
            className={`
              rounded-lg border border-border/70 p-6 transition-all duration-300
              ${plan.popular ? 'bg-card shadow-lg relative' : 'bg-card/50 hover:shadow-md'}
            `}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full">
                Recommended
              </div>
            )}
            
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
              <div className="flex flex-col items-center">
                <div className="price-highlight animate-pulse-subtle">
                  <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-sky-500 relative">
                    <span className="absolute -top-5 -left-4 text-xl md:text-2xl">$</span>
                    {plan.price}
                  </span>
                </div>
                {!plan.isLifetime && (
                  <span className="text-xl text-primary/70 mt-2">per month{plan.featuresObj?.maxCalls ? `, per channel` : ''}</span>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full rounded-full py-6 text-lg"
              onClick={() => handleUpgrade(plan)}
              disabled={isLoading || processingPlan === plan.id || currentPlan === plan.id}
            >
              {processingPlan === plan.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === plan.id ? (
                "Current Plan"
              ) : (
                "Upgrade Now"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
