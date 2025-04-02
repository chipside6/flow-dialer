
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "./types";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Initial delay before retrying (in ms)
const INITIAL_RETRY_DELAY = 1000;

/**
 * Fetches the subscription data for a user with retry logic
 */
export const fetchSubscription = async (userId: string | undefined): Promise<Subscription | null> => {
  if (!userId) {
    console.log("No user authenticated, cannot fetch subscription");
    return null;
  }
  
  let retryAttempt = 0;
  
  const executeWithRetry = async (): Promise<Subscription | null> => {
    try {
      console.log(`Fetching subscription for user: ${userId} (attempt ${retryAttempt + 1})`);
      
      // Check for active subscription in the database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching subscription:", error);
        throw new Error(error.message || 'Database error');
      }
      
      if (data) {
        console.log("Found active subscription:", data);
        
        // Check if it's a trial plan and if it has expired
        if (data.plan_id === 'trial' && data.current_period_end) {
          const endDate = new Date(data.current_period_end);
          const now = new Date();
          
          if (now > endDate) {
            console.log("Trial has expired");
            
            // Update the subscription to inactive
            await supabase
              .from('subscriptions')
              .update({ status: 'inactive' })
              .eq('id', data.id);
              
            return null;
          }
        }
        
        return data as Subscription;
      }
      
      return null;
    } catch (error) {
      // If we haven't exceeded max retries, try again with exponential backoff
      if (retryAttempt < MAX_RETRIES) {
        retryAttempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry();
      }
      
      console.error("Max retries exceeded in fetchSubscription:", error);
      throw error;
    }
  };
  
  return executeWithRetry();
};

/**
 * Fetches the user's call count with retry logic
 */
export const fetchUserCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  let retryAttempt = 0;
  
  const executeWithRetry = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('total_calls')
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error fetching call count:", error);
        throw new Error(error.message || 'Database error');
      }
      
      return data.reduce((sum, campaign) => sum + (campaign.total_calls || 0), 0);
    } catch (error) {
      // If we haven't exceeded max retries, try again with exponential backoff
      if (retryAttempt < MAX_RETRIES) {
        retryAttempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
        console.log(`Retrying call count fetch after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry();
      }
      
      console.error("Max retries exceeded in fetchUserCallCount:", error);
      throw error;
    }
  };
  
  return executeWithRetry();
};

/**
 * Creates a lifetime subscription with retry logic
 */
export const createLifetimeSubscription = async (
  userId: string | undefined, 
  plan: PricingPlan & { trialEndDate?: string }
): Promise<boolean> => {
  if (!userId) return false;
  
  let retryAttempt = 0;
  
  const executeWithRetry = async (): Promise<boolean> => {
    try {
      console.log("Activating plan for user:", userId);
      
      // For trial plans, include the end date
      const currentPeriodEnd = plan.isTrial && plan.trialEndDate 
        ? plan.trialEndDate 
        : null;
      
      // First, check if user already has a subscription
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching existing subscription:", fetchError);
        throw new Error(fetchError.message || 'Database error');
      }
      
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_id: plan.id,
            plan_name: plan.name,
            status: 'active',
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw new Error(updateError.message || 'Database error');
        }
      } else {
        // Insert new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: plan.id,
            plan_name: plan.name,
            status: 'active',
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Error creating subscription:", insertError);
          throw new Error(insertError.message || 'Database error');
        }
      }
      
      console.log("Plan activated successfully");
      return true;
    } catch (error) {
      // If we haven't exceeded max retries, try again with exponential backoff
      if (retryAttempt < MAX_RETRIES) {
        retryAttempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
        console.log(`Retrying subscription creation after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry();
      }
      
      console.error("Max retries exceeded in createLifetimeSubscription:", error);
      throw error;
    }
  };
  
  return executeWithRetry();
};

export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId);
};
