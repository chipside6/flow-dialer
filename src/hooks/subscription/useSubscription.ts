
import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { getPlanById } from "@/hooks/subscription/subscriptionApi";
import { useSubscriptionLimit } from "./useSubscriptionLimit";
import { useLifetimePlan } from "./useLifetimePlan";
import { UseSubscriptionReturn, PlanDetails } from "./types";
import { useSubscriptionState } from "./useSubscriptionState";
import { useSubscriptionCache } from "./useSubscriptionCache";
import { useSubscriptionFetch } from "./useSubscriptionFetch";

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  
  // Manage subscription state
  const {
    currentPlan,
    setCurrentPlan,
    subscription,
    setSubscription,
    trialExpired,
    setTrialExpired,
    isInitializing,
    setIsInitializing,
    initializedRef
  } = useSubscriptionState();

  // Manage subscription cache
  const { updateCache } = useSubscriptionCache({
    initializedRef,
    setCurrentPlan,
    setSubscription,
    setTrialExpired
  });

  // Handle subscription data fetching
  const {
    isLoading,
    error,
    fetchCurrentSubscription: fetchSubscription
  } = useSubscriptionFetch({
    userId: user?.id,
    setCurrentPlan,
    setSubscription,
    setTrialExpired,
    setIsInitializing,
    updateCache
  });

  // Wrapper to ensure void return type - use memoization to prevent recreating on each render
  const fetchCurrentSubscription = useCallback(async (): Promise<void> => {
    await fetchSubscription();
  }, [fetchSubscription]);

  // Use the subscription limit hook with optimized parameters
  const { 
    callCount, 
    showLimitDialog, 
    closeLimitDialog,
    hasReachedLimit,
    callLimit,
    checkAndShowLimitDialog,
    dailyCallCount,
    dailyCallLimit,
    monthlyCallCount,
    monthlyCallLimit
  } = useSubscriptionLimit(user?.id, currentPlan);

  // Use the lifetime plan activation hook and ensure it returns the correct type
  const { activateLifetimePlan: activatePlan } = useLifetimePlan(user?.id, fetchCurrentSubscription);
  
  // Memoize to prevent recreation on each render
  const activateLifetimePlan = useCallback(async (planId?: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const result = await activatePlan(planId);
      
      if (!result.success && result.error) {
        const error = new Error(result.error.message);
        return { success: false, error };
      }
      
      // On success, update local cache immediately
      if (result.success) {
        setCurrentPlan('lifetime');
        localStorage.setItem('userSubscriptionPlan', 'lifetime');
      }
      
      return { success: result.success };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, error };
    }
  }, [activatePlan, setCurrentPlan]);

  // Memoize this function to prevent recreation on each render
  const getPlanDetailsById = useCallback((planId: string): PlanDetails | null => {
    const plan = getPlanById(planId);
    if (!plan) return null;
    
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      features: plan.features,
      isLifetime: plan.isLifetime || false,
      isTrial: plan.isTrial || false,
      callLimit: plan.featuresObj?.maxCalls || 1000,
      trialDays: plan.trialDays
    };
  }, []);

  // Combine isLoading with isInitializing for more accurate loading state
  const combinedIsLoading = isLoading || isInitializing;

  // Use useMemo to prevent recreation of the return object on each render
  return useMemo(() => ({
    isLoading: combinedIsLoading,
    currentPlan,
    subscription,
    callCount,
    showLimitDialog,
    closeLimitDialog,
    fetchCurrentSubscription,
    activateLifetimePlan,
    getPlanById: getPlanDetailsById,
    error,
    hasReachedLimit,
    callLimit,
    trialExpired,
    checkAndShowLimitDialog,
    dailyCallCount,
    dailyCallLimit,
    monthlyCallCount,
    monthlyCallLimit
  }), [
    combinedIsLoading,
    currentPlan,
    subscription,
    callCount,
    showLimitDialog,
    closeLimitDialog,
    fetchCurrentSubscription,
    activateLifetimePlan,
    getPlanDetailsById,
    error,
    hasReachedLimit,
    callLimit,
    trialExpired,
    checkAndShowLimitDialog,
    dailyCallCount,
    dailyCallLimit,
    monthlyCallCount,
    monthlyCallLimit
  ]);
};
