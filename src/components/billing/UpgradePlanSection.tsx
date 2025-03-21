
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";
import { Check, Loader2 } from "lucide-react";
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
      <h2 className="text-2xl font-bold mb-6 text-left">Upgrade Your Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upgradePlans.map((plan) => (
          <div
            key={plan.id}
            className={`
              rounded-lg border border-border/70 p-5 transition-all duration-300 relative h-full flex flex-col
              ${plan.popular ? 'bg-card shadow-lg' : 'bg-card/50 hover:shadow-md'}
            `}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full whitespace-nowrap z-10">
                Recommended
              </div>
            )}
            
            <div className="mb-2 mt-4">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground text-sm">{plan.description}</p>
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
            </div>
            
            <div className="space-y-2.5 mb-4 flex-grow">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-auto">
              {/* Don't show button for free plan */}
              {plan.id !== "free" && (
                <Button 
                  className="w-full"
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
