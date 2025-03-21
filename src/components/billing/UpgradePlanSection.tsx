
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export const UpgradePlanSection = () => {
  const { currentPlan, activateLifetimePlan, isLoading, callCount } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset processing state on component mount
  useEffect(() => {
    setProcessingPlan(null);
  }, []);

  // Only show lifetime plan
  const getUpgradePlans = () => {
    return pricingPlans.filter(plan => plan.id === "lifetime");
  };

  const upgradePlans = getUpgradePlans();
  
  // Calculate remaining calls for free plan
  const maxFreeCalls = 500;
  const remainingCalls = Math.max(0, maxFreeCalls - (callCount || 0));
  const callUsagePercentage = Math.min(100, ((callCount || 0) / maxFreeCalls) * 100);

  const handleUpgrade = async (plan: PricingPlan) => {
    // If already processing, prevent multiple clicks
    if (processingPlan) {
      return;
    }
    
    console.log("Upgrade button clicked for plan:", plan.id);
    setProcessingPlan(plan.id);
    
    try {
      // Call the subscription service to activate the lifetime plan
      console.log("Attempting to activate lifetime plan");
      const result = await activateLifetimePlan();
      console.log("Activation result:", result);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Your lifetime plan has been activated.",
          variant: "default",
        });
        
        // Redirect to dashboard after successful activation
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
        // Make sure to reset processing state
        setProcessingPlan(null);
      }
    } catch (error) {
      console.error("Error activating plan:", error);
      toast({
        title: "Error",
        description: "Failed to activate the plan. Please try again.",
        variant: "destructive",
      });
      // Make sure to reset processing state on error
      setProcessingPlan(null);
    } finally {
      // This should reset the processing state
      // but let's keep the previous reset calls for safety
      setProcessingPlan(null);
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
      
      {/* Show call usage for free plan */}
      {currentPlan === "free" && (
        <div className="mb-8 p-6 bg-muted/10 rounded-lg border border-border/70">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-lg">Monthly Call Usage</h3>
            <span className="text-sm font-medium">{callCount} / {maxFreeCalls} calls</span>
          </div>
          <Progress value={callUsagePercentage} className="h-2 mb-3" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>{remainingCalls} calls remaining this month</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {upgradePlans.map((plan) => (
          <div
            key={plan.id}
            className="relative overflow-hidden rounded-xl border bg-card shadow-lg"
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-4 font-medium text-xs clip-ribbon">
                BEST VALUE
              </div>
            )}
            
            <div className="flex flex-col md:flex-row">
              {/* Plan info section */}
              <div className="p-6 md:p-8 md:w-2/5 border-b md:border-b-0 md:border-r border-border/70">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-[12rem] font-bold leading-none tracking-tight">${plan.price}</span>
                  <span className="text-muted-foreground ml-2 text-xl">one-time</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
                
                <div className="mt-6">
                  <Button 
                    className="w-full py-6 text-base"
                    onClick={() => handleUpgrade(plan)}
                    type="button"
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : currentPlan === plan.id ? (
                      "Current Plan"
                    ) : (
                      "Upgrade Now"
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Features section */}
              <div className="p-6 md:p-8 md:w-3/5 bg-card">
                <h4 className="font-semibold mb-4 text-lg">What's included:</h4>
                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
