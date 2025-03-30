
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createLifetimeSubscription } from "./subscriptionApi";
import { pricingPlans } from "@/data/pricingPlans";

export const useLifetimePlan = (
  userId: string | undefined,
  refreshSubscription: () => Promise<any>
) => {
  const { toast } = useToast();
  const [isActivating, setIsActivating] = useState(false);
  
  // Get the lifetime plan
  const lifetimePlan = pricingPlans.find(plan => plan.isLifetime);
  
  const activateLifetimePlan = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upgrade your plan",
        variant: "destructive",
      });
      return {
        success: false,
        error: { message: "Authentication required" }
      };
    }
    
    if (!lifetimePlan) {
      toast({
        title: "Plan not found",
        description: "The lifetime plan could not be found",
        variant: "destructive",
      });
      return {
        success: false,
        error: { message: "Plan not found" }
      };
    }
    
    try {
      setIsActivating(true);
      
      const success = await createLifetimeSubscription(userId, lifetimePlan);
      
      if (success) {
        toast({
          title: "Lifetime Plan Activated",
          description: "You now have lifetime access to all features!",
        });
        
        // Refresh subscription data
        await refreshSubscription();
        
        return {
          success: true,
          plan: lifetimePlan
        };
      }
      
      throw new Error("Failed to activate lifetime plan");
    } catch (error: any) {
      console.error("Error activating lifetime plan:", error);
      
      toast({
        title: "Error upgrading plan",
        description: error.message || "There was a problem activating your plan",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: { message: error.message || "There was a problem activating your plan" }
      };
    } finally {
      setIsActivating(false);
    }
  };
  
  const activateTrialPlan = async () => {
    if (!userId) {
      return {
        success: false,
        error: { message: "Authentication required" }
      };
    }
    
    const trialPlan = pricingPlans.find(plan => plan.isTrial);
    
    if (!trialPlan) {
      return {
        success: false,
        error: { message: "Trial plan not found" }
      };
    }
    
    try {
      // Calculate trial end date (3 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);
      
      // Create a modified trial plan with the end date
      const trialPlanWithEndDate = {
        ...trialPlan,
        trialEndDate: trialEndDate.toISOString()
      };
      
      // Activate the trial plan
      const success = await createLifetimeSubscription(userId, trialPlanWithEndDate);
      
      if (success) {
        // Refresh subscription data
        await refreshSubscription();
        
        return {
          success: true,
          plan: trialPlanWithEndDate
        };
      }
      
      throw new Error("Failed to activate trial plan");
    } catch (error: any) {
      console.error("Error activating trial plan:", error);
      
      return {
        success: false,
        error: { message: error.message || "There was a problem activating your trial" }
      };
    }
  };
  
  return {
    isActivating,
    activateLifetimePlan,
    activateTrialPlan
  };
};
