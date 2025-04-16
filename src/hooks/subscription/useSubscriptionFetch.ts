
import { useCallback, useEffect, useRef } from "react";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { fetchSubscription } from "./subscriptionApi";
import { Subscription } from "./types";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionFetchProps {
  userId: string | undefined;
  setCurrentPlan: (plan: string | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setTrialExpired: (expired: boolean) => void;
  setIsInitializing: (initializing: boolean) => void;
  updateCache: (subscription: Subscription | null, planId: string | null) => void;
}

export const useSubscriptionFetch = ({
  userId,
  setCurrentPlan,
  setSubscription,
  setTrialExpired,
  setIsInitializing,
  updateCache
}: SubscriptionFetchProps) => {
  const { toast } = useToast();
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup safety timeout to prevent stuck loading state
  useEffect(() => {
    // Set a safety timeout to ensure we never stay in initializing state
    initTimeoutRef.current = setTimeout(() => {
      console.warn("Subscription initialization timed out, falling back to free plan");
      setCurrentPlan('free');
      setSubscription(null);
      setTrialExpired(false);
      setIsInitializing(false);
      
      // Set cached free plan to avoid future timeouts
      localStorage.setItem('userSubscriptionPlan', 'free');
    }, 8000);
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [setCurrentPlan, setIsInitializing, setSubscription, setTrialExpired]);

  // Use cached fetch for subscription data with improved caching
  const { 
    data: subscriptionData,
    isLoading,
    error,
    refetch: refetchSubscription
  } = useCachedFetch(
    () => fetchSubscription(userId),
    {
      cacheKey: userId ? `subscription-${userId}` : undefined,
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      enabled: !!userId,
      retry: 3, // Increased retry attempts
      retryDelay: 1500, // Slightly longer delay between retries
      onSuccess: (data) => {
        // Clear safety timeout
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        
        if (data) {
          setCurrentPlan(data.plan_id);
          setSubscription(data);
          
          // Cache subscription data in localStorage with timestamp
          updateCache(data, null);
          
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
        setIsInitializing(false);
      },
      onError: (err) => {
        console.error("Error in fetchCurrentSubscription:", err);
        
        // Clear safety timeout
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        
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
        setIsInitializing(false);
      }
    }
  );

  // Enhanced fetch subscription function that uses the cached fetch
  const fetchCurrentSubscription = useCallback(async () => {
    if (!userId) {
      setCurrentPlan('free');
      setSubscription(null);
      setTrialExpired(false);
      localStorage.setItem('userSubscriptionPlan', 'free');
      localStorage.removeItem('userSubscription');
      setIsInitializing(false);
      return null;
    }
    
    // Clear any existing timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
    
    // Set a new safety timeout
    initTimeoutRef.current = setTimeout(() => {
      console.warn("Subscription fetch timed out, falling back to cached or free plan");
      setIsInitializing(false);
      
      // Try to use cached plan
      const cachedPlan = localStorage.getItem('userSubscriptionPlan');
      if (cachedPlan) {
        setCurrentPlan(cachedPlan);
      } else {
        setCurrentPlan('free');
      }
    }, 8000);
    
    await refetchSubscription(true); // Force refresh
    return subscriptionData;
  }, [userId, refetchSubscription, subscriptionData, setCurrentPlan, setSubscription, setTrialExpired, setIsInitializing]);

  return {
    subscriptionData,
    isLoading,
    error,
    fetchCurrentSubscription
  };
};
