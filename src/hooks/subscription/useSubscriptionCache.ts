
import { useCallback } from "react";
import { Subscription } from "./types";

interface SubscriptionCacheProps {
  initializedRef: React.MutableRefObject<boolean>;
  setCurrentPlan: (plan: string | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setTrialExpired: (expired: boolean) => void;
}

export const useSubscriptionCache = ({
  initializedRef,
  setCurrentPlan,
  setSubscription,
  setTrialExpired
}: SubscriptionCacheProps) => {
  // Load subscription data from cache
  const loadFromCache = useCallback(() => {
    if (initializedRef.current) return;
    
    try {
      const cachedPlanId = localStorage.getItem('userSubscriptionPlan');
      
      if (cachedPlanId) {
        setCurrentPlan(cachedPlanId);
        console.log("Loaded plan from cache:", cachedPlanId);
        
        // For trial plans, check if they might be expired based on cache
        if (cachedPlanId === 'trial') {
          const trialData = localStorage.getItem('userSubscription');
          if (trialData) {
            try {
              const parsedData = JSON.parse(trialData) as Subscription;
              setSubscription(parsedData);
              
              // Check if trial has expired
              if (parsedData.current_period_end) {
                const endDate = new Date(parsedData.current_period_end);
                const now = new Date();
                
                if (now > endDate) {
                  console.log("Trial has expired based on cached data");
                  setTrialExpired(true);
                  setCurrentPlan('free'); // Downgrade to free plan
                  localStorage.setItem('userSubscriptionPlan', 'free');
                }
              }
            } catch (err) {
              console.error("Error parsing cached subscription:", err);
            }
          }
        } else {
          setTrialExpired(false);
        }
      } else {
        // Default to free plan if no plan is cached
        setCurrentPlan('free');
        localStorage.setItem('userSubscriptionPlan', 'free');
      }
    } catch (err) {
      console.error("Error loading from cache:", err);
      // Default to free plan on error
      setCurrentPlan('free');
    }
  }, [initializedRef, setCurrentPlan, setSubscription, setTrialExpired]);
  
  // Update cache with latest subscription data
  const updateCache = useCallback((subscription: Subscription | null, planId: string | null): void => {
    try {
      if (subscription) {
        localStorage.setItem('userSubscription', JSON.stringify(subscription));
        localStorage.setItem('userSubscriptionPlan', subscription.plan_id);
        localStorage.setItem('subscriptionCacheTime', Date.now().toString());
      } else if (planId) {
        // If only planId is provided (not a full subscription object)
        localStorage.setItem('userSubscriptionPlan', planId);
        localStorage.setItem('subscriptionCacheTime', Date.now().toString());
      } else {
        // If no subscription or plan, default to free
        localStorage.setItem('userSubscriptionPlan', 'free');
        localStorage.removeItem('userSubscription');
      }
    } catch (err) {
      console.error("Error updating subscription cache:", err);
    }
  }, []);
  
  return { loadFromCache, updateCache };
};
