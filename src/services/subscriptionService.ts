
import { toast } from "@/components/ui/use-toast";
import { API_URL, getStoredSession } from "./authService";
import { PricingPlan, pricingPlans } from "@/data/pricingPlans";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch current subscription
export const fetchSubscription = async (userId: string | undefined): Promise<Subscription | null> => {
  if (!userId) {
    console.log("No user authenticated, cannot fetch subscription");
    return null;
  }
  
  try {
    console.log("Fetching subscription for user:", userId);
    const session = getStoredSession();
    
    if (!session) {
      console.error("No active session found");
      return null;
    }
    
    const response = await fetch(`${API_URL}/subscriptions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${session.user.id}`
      }
    });
    
    if (!response.ok) {
      if (response.status !== 404) { // 404 just means no subscription found
        throw new Error('Failed to fetch subscription');
      }
      return null;
    }
    
    const data = await response.json();
    console.log("Found active subscription:", data);
    
    return data as Subscription;
  } catch (error) {
    console.error("Error in fetchSubscription:", error);
    return null;
  }
};

// Fetch user's total call count
export const fetchUserCallCount = async (userId: string | undefined): Promise<number> => {
  if (!userId) return 0;
  
  try {
    const session = getStoredSession();
    
    if (!session) {
      console.error("No active session found");
      return 0;
    }
    
    const response = await fetch(`${API_URL}/campaigns/call-count/${userId}`, {
      headers: {
        'Authorization': `Bearer ${session.user.id}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch call count');
    }
    
    const data = await response.json();
    return data.totalCalls || 0;
  } catch (error) {
    console.error("Error in fetchCallCount:", error);
    return 0;
  }
};

// Create a lifetime subscription
export const createLifetimeSubscription = async (
  userId: string | undefined, 
  plan: PricingPlan
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    console.log("Activating lifetime plan for user:", userId);
    const session = getStoredSession();
    
    if (!session) {
      console.error("No active session found");
      return false;
    }
    
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}`
      },
      body: JSON.stringify({
        user_id: userId,
        plan_id: plan.id,
        plan_name: plan.name,
        status: 'active',
        current_period_end: null // Null for lifetime plans
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create lifetime subscription');
    }
    
    console.log("Lifetime plan activated successfully");
    return true;
  } catch (error) {
    console.error("Error in createLifetimeSubscription:", error);
    return false;
  }
};

// Get plan by ID
export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === planId);
};
