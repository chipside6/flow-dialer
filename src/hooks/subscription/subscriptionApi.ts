
import { Subscription } from "./types";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";
import { supabase } from "@/integrations/supabase/client";

// Fetch user's subscription data from Supabase
export const fetchSubscription = async (userId: string | undefined): Promise<Subscription | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
      
    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
    
    return data as Subscription;
  } catch (error) {
    console.error("Error in fetchSubscription:", error);
    return null;
  }
};

// Fetch total call count for a user
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
    
    // Sum up all call counts from all campaigns
    const totalCalls = data.reduce((sum, campaign) => sum + (campaign.total_calls || 0), 0);
    return totalCalls;
  } catch (error) {
    console.error("Error in fetchUserCallCount:", error);
    return 0;
  }
};

// Fetch daily call count for a user
export const fetchUserDailyCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('calls')
      .select('count')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());
      
    if (error) {
      console.error("Error fetching daily call count:", error);
      return 0;
    }
    
    // Count the total number of calls made today
    return data.length;
  } catch (error) {
    console.error("Error in fetchUserDailyCallCount:", error);
    return 0;
  }
};

// Fetch monthly call count for a user
export const fetchUserMonthlyCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  try {
    // Get first day of current month
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('calls')
      .select('count')
      .eq('user_id', userId)
      .gte('created_at', firstDay.toISOString());
      
    if (error) {
      console.error("Error fetching monthly call count:", error);
      return 0;
    }
    
    // Count the total number of calls made this month
    return data.length;
  } catch (error) {
    console.error("Error in fetchUserMonthlyCallCount:", error);
    return 0;
  }
};

// Get plan by ID
export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId);
};
