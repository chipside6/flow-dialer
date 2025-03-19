
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { pricingPlans, PricingPlan } from "@/data/pricingPlans";

export const useSubscription = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const fetchCurrentSubscription = async () => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }
      
      if (data) {
        setCurrentPlan(data.plan_id);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Error in fetchCurrentSubscription:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradePlan = async (newPlanId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      return { success: false };
    }
    
    try {
      setIsLoading(true);
      
      // Get the plan details
      const selectedPlan = pricingPlans.find(plan => plan.id === newPlanId);
      
      if (!selectedPlan) {
        toast({
          title: "Plan not found",
          description: "The selected plan does not exist",
          variant: "destructive",
        });
        return { success: false };
      }
      
      // Upsert the subscription record
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });
      
      if (error) {
        console.error("Error upgrading subscription:", error);
        toast({
          title: "Upgrade failed",
          description: "There was a problem upgrading your plan. Please try again.",
          variant: "destructive",
        });
        return { success: false };
      }
      
      setCurrentPlan(newPlanId);
      toast({
        title: "Plan upgraded",
        description: `You've successfully upgraded to the ${selectedPlan.name} plan!`,
      });
      
      return { success: true, plan: selectedPlan };
    } catch (error) {
      console.error("Error in upgradePlan:", error);
      toast({
        title: "Upgrade failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanById = (planId: string): PricingPlan | undefined => {
    return pricingPlans.find(plan => plan.id === planId);
  };

  return {
    isLoading,
    currentPlan,
    fetchCurrentSubscription,
    upgradePlan,
    getPlanById
  };
};
