import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "./types";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";
import { toast } from "@/components/ui/use-toast";

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Initial delay before retrying (in ms)
const INITIAL_RETRY_DELAY = 1000;
// Request timeout (in ms)
const REQUEST_TIMEOUT = 15000;

/**
 * Fetches the subscription data for a user with enhanced retry logic and timeouts
 */
export const fetchSubscription = async (userId: string | undefined): Promise<Subscription | null> => {
  if (!userId) {
    console.log("No user authenticated, cannot fetch subscription");
    return null;
  }
  
  let retryAttempt = 0;
  const abortController = new AbortController();
  
  // Set timeout for the request
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, REQUEST_TIMEOUT);
  
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
    } catch (error: any) {
      // Check if the request was aborted due to timeout
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.error("Request timed out while fetching subscription");
        toast({
          title: "Request timed out",
          description: "The server is taking too long to respond. Please try again later.",
          variant: "destructive"
        });
        throw new Error("Request timed out");
      }
      
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
  
  try {
    const result = await executeWithRetry();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Fetches the user's total call count
 */
export const fetchUserCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  let retryAttempt = 0;
  const abortController = new AbortController();
  
  // Set timeout for the request
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, REQUEST_TIMEOUT);
  
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
    } catch (error: any) {
      // Check if the request was aborted due to timeout
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.error("Request timed out while fetching call count");
        return 0; // Return 0 as fallback on timeout for this non-critical data
      }
      
      // If we haven't exceeded max retries, try again with exponential backoff
      if (retryAttempt < MAX_RETRIES) {
        retryAttempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
        console.log(`Retrying call count fetch after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry();
      }
      
      console.error("Max retries exceeded in fetchUserCallCount:", error);
      return 0; // Return 0 as fallback after max retries
    }
  };
  
  try {
    const result = await executeWithRetry();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    return 0; // Return 0 as ultimate fallback
  }
};

/**
 * Fetches the user's daily call count (calls made today)
 */
export const fetchUserDailyCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  let retryAttempt = 0;
  const abortController = new AbortController();
  
  // Set timeout for the request
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, REQUEST_TIMEOUT);
  
  const executeWithRetry = async (): Promise<number> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('total_calls')
        .eq('user_id', userId)
        .gte('updated_at', today.toISOString());
      
      if (error) {
        console.error("Error fetching daily call count:", error);
        throw new Error(error.message || 'Database error');
      }
      
      return data.reduce((sum, campaign) => sum + (campaign.total_calls || 0), 0);
    } catch (error: any) {
      // Handle error and retry logic as in other fetch functions
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.error("Request timed out while fetching daily call count");
        return 0;
      }
      
      if (retryAttempt < MAX_RETRIES) {
        retryAttempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
        console.log(`Retrying daily call count fetch after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry();
      }
      
      console.error("Max retries exceeded in fetchUserDailyCallCount:", error);
      return 0;
    }
  };
  
  try {
    const result = await executeWithRetry();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    return 0;
  }
};

/**
 * Fetches the user's monthly call count (calls made this month)
 */
export const fetchUserMonthlyCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  let retryAttempt = 0;
  const abortController = new AbortController();
  
  // Set timeout for the request
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, REQUEST_TIMEOUT);
  
  const executeWithRetry = async (): Promise<number> => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('total_calls')
        .eq('user_id', userId)
        .gte('updated_at', firstDayOfMonth.toISOString());
      
      if (error) {
        console.error("Error fetching monthly call count:", error);
        throw new Error(error.message || 'Database error');
      }
      
      return data.reduce((sum, campaign) => sum + (campaign.total_calls || 0), 0);
    } catch (error: any) {
      // Handle error and retry logic as in other fetch functions
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.error("Request timed out while fetching monthly call count");
        return 0;
      }
      
      if (retryAttempt < MAX_RETRIES) {
        retryAttempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
        console.log(`Retrying monthly call count fetch after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry();
      }
      
      console.error("Max retries exceeded in fetchUserMonthlyCallCount:", error);
      return 0;
    }
  };
  
  try {
    const result = await executeWithRetry();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    return 0;
  }
};

/**
 * Creates a lifetime subscription with enhanced retry logic and timeouts
 */
export const createLifetimeSubscription = async (
  userId: string | undefined, 
  plan: PricingPlan & { trialEndDate?: string }
): Promise<boolean> => {
  if (!userId) return false;
  
  let retryAttempt = 0;
  const abortController = new AbortController();
  
  // Set timeout for the request
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, REQUEST_TIMEOUT);
  
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
    } catch (error: any) {
      // Check if the request was aborted due to timeout
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.error("Request timed out while creating subscription");
        toast({
          title: "Request timed out",
          description: "The server is taking too long to respond. Please try again.",
          variant: "destructive"
        });
        throw new Error("Request timed out");
      }
      
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
  
  try {
    const result = await executeWithRetry();
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId);
};
