
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
  const [callCount, setCallCount] = useState<number>(0);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // Fetch subscription data when component mounts and when user changes
  useEffect(() => {
    if (user) {
      console.log("User authenticated, fetching subscription data");
      fetchCurrentSubscription();
      fetchCallCount();
    } else {
      console.log("No user authenticated, resetting subscription state");
      setIsLoading(false);
      setCurrentPlan(null);
      setSubscription(null);
      setCallCount(0);
    }
  }, [user]);

  const fetchCallCount = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('total_calls')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching call count:", error);
        return 0;
      }
      
      const totalCalls = data.reduce((sum, campaign) => sum + (campaign.total_calls || 0), 0);
      setCallCount(totalCalls);
      
      // Check if free user has reached limit
      if (currentPlan === 'free' && totalCalls >= 500) {
        setShowLimitDialog(true);
      }
      
      return totalCalls;
    } catch (error) {
      console.error("Error in fetchCallCount:", error);
      return 0;
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) {
      setIsLoading(false);
      return null;
    }
    
    try {
      console.log("Fetching subscription for user:", user.id);
      setIsLoading(true);
      
      // Check for active subscription in the database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching subscription:", error);
        setCurrentPlan('free');
        setSubscription(null);
        setIsLoading(false);
        return null;
      }
      
      if (data) {
        console.log("Found active subscription:", data);
        setCurrentPlan(data.plan_id);
        setSubscription(data);
        setIsLoading(false);
        return data;
      }
      
      console.log("No subscription data found, defaulting to free plan");
      setCurrentPlan('free');
      setSubscription(null);
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Error in fetchCurrentSubscription:", error);
      setCurrentPlan('free');
      setSubscription(null);
      setIsLoading(false);
      return null;
    }
  };

  const activateLifetimePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade to lifetime access",
        variant: "destructive",
      });
      return { success: false };
    }
    
    try {
      setIsLoading(true);
      
      // Get the lifetime plan details
      const lifetimePlan = pricingPlans.find(plan => plan.id === "lifetime");
      
      if (!lifetimePlan) {
        toast({
          title: "Plan not found",
          description: "The lifetime plan does not exist",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      console.log("Activating lifetime plan for user:", user.id);
      
      // Upsert the subscription record
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: lifetimePlan.id,
          plan_name: lifetimePlan.name,
          status: 'active',
          current_period_end: null // Null for lifetime plans
        }, { 
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error("Error upgrading to lifetime plan:", error);
        toast({
          title: "Upgrade failed",
          description: "There was a problem upgrading to the lifetime plan. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      console.log("Lifetime plan activated successfully");
      setCurrentPlan("lifetime");
      
      // Fetch the updated subscription to ensure data is current
      await fetchCurrentSubscription();
      
      toast({
        title: "Plan upgraded",
        description: "You have successfully upgraded to the Lifetime plan!",
      });
      
      setIsLoading(false);
      return { success: true, plan: lifetimePlan };
    } catch (error) {
      console.error("Error in activateLifetimePlan:", error);
      toast({
        title: "Activation failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return { success: false };
    }
  };

  const getPlanById = (planId: string): PricingPlan | undefined => {
    return pricingPlans.find(plan => plan.id === planId);
  };

  const closeLimitDialog = () => {
    setShowLimitDialog(false);
  };

  return {
    isLoading,
    currentPlan,
    subscription,
    callCount,
    showLimitDialog,
    closeLimitDialog,
    fetchCurrentSubscription,
    activateLifetimePlan,
    getPlanById
  };
};
