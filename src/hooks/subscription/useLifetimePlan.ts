
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createLifetimeSubscription, getPlanById } from "@/services/subscriptionService";
import { PricingPlan } from "@/data/pricingPlans";

export const useLifetimePlan = (
  userId: string | undefined,
  refreshSubscription: () => Promise<any>
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const activateLifetimePlan = async (): Promise<{ success: boolean; plan?: PricingPlan; error?: { message: string } }> => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade to lifetime access",
        variant: "destructive",
      });
      return { success: false, error: { message: "Authentication required" } };
    }
    
    try {
      setIsProcessing(true);
      
      // Get the lifetime plan details
      const lifetimePlan = getPlanById("lifetime");
      
      if (!lifetimePlan) {
        toast({
          title: "Plan not found",
          description: "The lifetime plan does not exist",
          variant: "destructive",
        });
        return { success: false, error: { message: "Lifetime plan not found" } };
      }
      
      const success = await createLifetimeSubscription(userId, lifetimePlan);
      
      if (!success) {
        toast({
          title: "Upgrade failed",
          description: "There was a problem upgrading to the lifetime plan. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: { message: "Failed to create lifetime subscription" } };
      }
      
      // Fetch the updated subscription to ensure data is current
      await refreshSubscription();
      
      toast({
        title: "Plan upgraded",
        description: "You have successfully upgraded to the Lifetime plan!",
      });
      
      return { success: true, plan: lifetimePlan };
    } catch (error: any) {
      console.error("Error in activateLifetimePlan:", error);
      toast({
        title: "Activation failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: { message: error.message || "An unexpected error occurred" } };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    activateLifetimePlan
  };
};
