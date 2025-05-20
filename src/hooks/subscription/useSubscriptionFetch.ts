
import { useCallback } from "react";
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

  // Use cached fetch for subscription data with improved caching
  const { 
    data: subscriptionData,
    isLoading,
    error,
    refetch: refetchSubscription
  } = useCachedFetch<Subscription | null>(
    () => fetchSubscription(userId),
    {
      cacheKey: userId ? `subscription-${userId}` : undefined,
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      enabled: !!userId,
      retry: 3, // Increased retry attempts
      retryDelay: 1500, // Slightly longer delay between retries
      onSuccess: (data) => {
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
    
    await refetchSubscription();
    return subscriptionData;
  }, [userId, refetchSubscription, subscriptionData, setCurrentPlan, setSubscription, setTrialExpired, setIsInitializing]);

  return {
    subscriptionData,
    isLoading,
    error,
    fetchCurrentSubscription
  };
};
