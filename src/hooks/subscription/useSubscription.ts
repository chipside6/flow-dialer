
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchSubscription, getPlanById } from "@/hooks/subscription/subscriptionApi";
import { useSubscriptionLimit } from "./useSubscriptionLimit";
import { useLifetimePlan } from "./useLifetimePlan";
import { Subscription, UseSubscriptionReturn } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { useCachedFetch } from "@/hooks/useCachedFetch";

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trialExpired, setTrialExpired] = useState<boolean>(false);

  // Use cached fetch for subscription data
  const { 
    data: subscriptionData,
    isLoading,
    error,
    refetch: refetchSubscription
  } = useCachedFetch(
    () => fetchSubscription(user?.id),
    {
      cacheKey: user?.id ? `subscription-${user.id}` : undefined,
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      enabled: !!user,
      retry: 2,
      retryDelay: 2000,
      onSuccess: (data) => {
        if (data) {
          setCurrentPlan(data.plan_id);
          setSubscription(data);
          
          // Check if trial has expired
          if (data.plan_id === 'trial' && data.current_period_end) {
            const endDate = new Date(data.current_period_end);
            const now = new Date();
            
            if (now > endDate) {
              console.log("Trial has expired");
              setTrialExpired(true);
              setCurrentPlan('free'); // Downgrade to free plan
            } else {
              setTrialExpired(false);
            }
          } else {
            setTrialExpired(false);
          }
        } else {
          setCurrentPlan('free');
          setSubscription(null);
          setTrialExpired(false);
        }
      },
      onError: (err) => {
        console.error("Error in fetchCurrentSubscription:", err);
        setCurrentPlan('free');
        setSubscription(null);
        setTrialExpired(false);
        
        toast({
          title: "Subscription Error",
          description: "Could not retrieve your subscription information. Default free plan applied.",
          variant: "destructive"
        });
      }
    }
  );

  // Enhanced fetch subscription function that uses the cached fetch
  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) {
      setCurrentPlan('free');
      setSubscription(null);
      setTrialExpired(false);
      return null;
    }
    
    await refetchSubscription(true); // Force refresh
    return subscriptionData;
  }, [user, refetchSubscription, subscriptionData]);

  // Use the subscription limit hook with optimized parameters
  const { 
    callCount, 
    showLimitDialog, 
    closeLimitDialog,
    hasReachedLimit,
    callLimit,
    checkAndShowLimitDialog
  } = useSubscriptionLimit(user?.id, currentPlan);

  // Use the lifetime plan activation hook and ensure it returns the correct type
  const { activateLifetimePlan: activatePlan } = useLifetimePlan(user?.id, fetchCurrentSubscription);
  
  // Wrapper to ensure correct type is returned
  const activateLifetimePlan = useCallback(async (planId?: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      const result = await activatePlan();
      
      if (!result.success && result.error) {
        // Convert the plain error object to a proper Error instance
        const error = new Error(result.error.message);
        return { success: false, error };
      }
      
      return { success: result.success };
    } catch (err) {
      // Ensure any caught error is returned as a proper Error instance
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, error };
    }
  }, [activatePlan]);

  return {
    isLoading,
    currentPlan,
    subscription,
    callCount,
    showLimitDialog,
    closeLimitDialog,
    fetchCurrentSubscription,
    activateLifetimePlan,
    getPlanById,
    error,
    hasReachedLimit,
    callLimit,
    trialExpired,
    checkAndShowLimitDialog
  };
};
