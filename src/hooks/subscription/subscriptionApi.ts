
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "./types";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";
import { useToast } from "@/components/ui/use-toast";

export const fetchSubscription = async (userId: string | undefined): Promise<Subscription | null> => {
  if (!userId) {
    console.log("No user authenticated, cannot fetch subscription");
    return null;
  }
  
  try {
    console.log("Fetching subscription for user:", userId);
    
    // Check for active subscription in the database
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching subscription:", error);
      return null;
    }
    
    if (data) {
      console.log("Found active subscription:", data);
      return data as Subscription;
    }
    
    return null;
  } catch (error) {
    console.error("Error in fetchSubscription:", error);
    return null;
  }
};

export const fetchUserCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('total_calls')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching call count:", error);
      return 0;
    }
    
    return data.reduce((sum, campaign) => sum + (campaign.total_calls || 0), 0);
  } catch (error) {
    console.error("Error in fetchCallCount:", error);
    return 0;
  }
};

export const createLifetimeSubscription = async (
  userId: string | undefined, 
  plan: PricingPlan
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    console.log("Activating lifetime plan for user:", userId);
    
    // Upsert the subscription record
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        plan_name: plan.name,
        status: 'active',
        current_period_end: null // Null for lifetime plans
      }, { 
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error("Error upgrading to lifetime plan:", error);
      return false;
    }
    
    console.log("Lifetime plan activated successfully");
    return true;
  } catch (error) {
    console.error("Error in createLifetimeSubscription:", error);
    return false;
  }
};

export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId);
};
