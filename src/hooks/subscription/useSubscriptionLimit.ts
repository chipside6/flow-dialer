
import { useState, useEffect } from "react";
import { fetchUserCallCount } from "./subscriptionApi";
import { pricingPlans } from "@/data/pricingPlans";
import { useCachedFetch } from "@/hooks/useCachedFetch";

/**
 * Hook for checking subscription limits like call count
 */
export const useSubscriptionLimit = (userId: string | undefined, currentPlan: string | null) => {
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [callLimit, setCallLimit] = useState(0);

  // Get the call limit for the current plan
  useEffect(() => {
    if (currentPlan) {
      const plan = pricingPlans.find(p => p.id === currentPlan);
      setCallLimit(plan?.features?.maxCalls || 0);
    } else {
      // Default to free plan limit
      const freePlan = pricingPlans.find(p => p.id === 'free');
      setCallLimit(freePlan?.features?.maxCalls || 0);
    }
  }, [currentPlan]);

  // Use cached fetch for call count with automatic retries
  const { 
    data: callCount = 0, 
    refetch: fetchCallCount,
    isLoading: isLoadingCallCount,
    error: callCountError
  } = useCachedFetch(
    () => fetchUserCallCount(userId), 
    {
      cacheKey: userId ? `call-count-${userId}` : undefined,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      enabled: !!userId,
      retry: 2,
      retryDelay: 1500,
    }
  );

  // Close the limit dialog
  const closeLimitDialog = () => {
    setShowLimitDialog(false);
  };

  // Check if user has reached call limit
  useEffect(() => {
    if (callLimit > 0 && callCount >= callLimit) {
      setShowLimitDialog(true);
    }
  }, [callCount, callLimit]);

  return {
    callCount,
    showLimitDialog,
    closeLimitDialog,
    fetchCallCount,
    isLoadingCallCount,
    callCountError,
    callLimit,
    hasReachedLimit: callLimit > 0 && callCount >= callLimit
  };
};
