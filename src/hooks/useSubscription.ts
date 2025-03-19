
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { pricingPlans, PricingPlan } from "@/data/pricingPlans";

export const useSubscription = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Fetch subscription data on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    } else {
      setIsLoading(false);
      setCurrentPlan(null);
      setSubscription(null);
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    if (!user) return null;
    
    try {
      console.log("Fetching subscription for user:", user.id);
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error code
          console.error("Error fetching subscription:", error);
        }
        setCurrentPlan(null);
        setSubscription(null);
        return null;
      }
      
      if (data) {
        console.log("Found active subscription:", data);
        setCurrentPlan(data.plan_id);
        setSubscription(data);
        return data;
      }
      
      setCurrentPlan(null);
      setSubscription(null);
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
      
      console.log("Upgrading to plan:", selectedPlan.name, "for user:", user.id);
      
      // Upsert the subscription record
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }, { 
          onConflict: 'user_id'
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
      
      console.log("Subscription upgraded successfully:", data);
      setCurrentPlan(newPlanId);
      
      // Fetch the subscription again to get the full data
      const updatedSubscription = await fetchCurrentSubscription();
      setSubscription(updatedSubscription);
      
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
    subscription,
    fetchCurrentSubscription,
    upgradePlan,
    getPlanById
  };
};
