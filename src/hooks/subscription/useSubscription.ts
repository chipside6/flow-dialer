
import { useState, useEffect, useCallback, useRef } from "react";
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
  const initializedRef = useRef(false);

  // On mount, try to initialize from localStorage for faster UI rendering
  useEffect(() => {
    if (!initializedRef.current) {
      const cachedPlan = localStorage.getItem('userSubscriptionPlan');
      const cachedSubscription = localStorage.getItem('userSubscription');
      
      if (cachedPlan) {
        setCurrentPlan(cachedPlan);
        console.log("Initialized subscription plan from cache:", cachedPlan);
      }
      
      if (cachedSubscription) {
        try {
          const parsedSubscription = JSON.parse(cachedSubscription);
          setSubscription(parsedSubscription);
          console.log("Initialized subscription from cache");
          
          // Check cached trial expiration
          if (parsedSubscription.plan_id === 'trial' && parsedSubscription.current_period_end) {
            const endDate = new Date(parsedSubscription.current_period_end);
            const now = new Date();
            setTrialExpired(now > endDate);
          }
        } catch (e) {
          console.error("Error parsing cached subscription:", e);
        }
      }
      
      initializedRef.current = true;
    }
  }, []);

  // Use cached fetch for subscription data with improved caching
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
      retry: 3, // Increased retry attempts
      retryDelay: 1500, // Slightly longer delay between retries
      onSuccess: (data) => {
        if (data) {
          setCurrentPlan(data.plan_id);
          setSubscription(data);
          
          // Cache subscription data in localStorage with timestamp
          localStorage.setItem('userSubscriptionPlan', data.plan_id);
          localStorage.setItem('userSubscription', JSON.stringify(data));
          localStorage.setItem('subscriptionLastUpdated', Date.now().toString());
          
          // Check if trial has expired
          if (data.plan_id === 'trial' && data.current_period_end) {
            const endDate = new Date(data.current_period_end);
            const now = new Date();
            
            if (now > endDate) {
              console.log("Trial has expired");
              setTrialExpired(true);
              setCurrentPlan('free'); // Downgrade to free plan
              localStorage.setItem('userSubscriptionPlan', 'free');
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
          
          // Cache default free plan
          localStorage.setItem('userSubscriptionPlan', 'free');
          localStorage.removeItem('userSubscription');
        }
      },
      onError: (err) => {
        console.error("Error in fetchCurrentSubscription:", err);
        
        // Check if we have cached data
        const cachedPlan = localStorage.getItem('userSubscriptionPlan');
        
        if (cachedPlan && cachedPlan !== 'free') {
          // Use cached data if available but show a toast
          toast({
            title: "Using cached subscription data",
            description: "We couldn't connect to the server. Using your last known subscription status.",
            variant: "default"
          });
        } else {
          // Fall back to free plan
          setCurrentPlan('free');
          setSubscription(null);
          setTrialExpired(false);
          
          // Cache default free plan on error
          localStorage.setItem('userSubscriptionPlan', 'free');
          localStorage.removeItem('userSubscription');
          
          toast({
            title: "Subscription Error",
            description: "Could not retrieve your subscription information. Default free plan applied.",
            variant: "destructive"
          });
        }
      }
    }
  );

  // Enhanced fetch subscription function that uses the cached fetch
  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) {
      setCurrentPlan('free');
      setSubscription(null);
      setTrialExpired(false);
      localStorage.setItem('userSubscriptionPlan', 'free');
      localStorage.removeItem('userSubscription');
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
      const result = await activatePlan(planId);
      
      if (!result.success && result.error) {
        // Convert the plain error object to a proper Error instance
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
