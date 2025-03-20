
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

  // Fetch subscription data on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
      fetchCallCount();
    } else {
      setIsLoading(false);
      setCurrentPlan(null);
      setSubscription(null);
      setCallCount(0);
    }
  }, [user]);

  const fetchCallCount = async () => {
    if (!user) return 0;
    
    try {
      // In a real app, this would fetch from campaigns or a dedicated calls table
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
        setCurrentPlan('free');
        setSubscription(null);
        return null;
      }
      
      if (data) {
        console.log("Found active subscription:", data);
        setCurrentPlan(data.plan_id);
        setSubscription(data);
        return data;
      }
      
      setCurrentPlan('free');
      setSubscription(null);
      return null;
    } catch (error) {
      console.error("Error in fetchCurrentSubscription:", error);
      return null;
    } finally {
      setIsLoading(false);
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
        return { success: false };
      }
      
      console.log("Lifetime plan activated successfully:", data);
      setCurrentPlan("lifetime");
      
      // Fetch the subscription again to get the full data
      const updatedSubscription = await fetchCurrentSubscription();
      setSubscription(updatedSubscription);
      
      toast({
        title: "Lifetime access activated",
        description: "You now have unlimited access to all features forever!",
      });
      
      return { success: true, plan: lifetimePlan };
    } catch (error) {
      console.error("Error in activateLifetimePlan:", error);
      toast({
        title: "Activation failed",
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
