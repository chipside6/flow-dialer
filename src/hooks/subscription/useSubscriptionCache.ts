import { useEffect } from "react";
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
      // Keep isInitializing true until the API call completes
    }
  }, [initializedRef, setCurrentPlan, setSubscription, setTrialExpired]);

  const updateCache = (subscription: Subscription | null, planId: string | null) => {
    if (subscription) {
      localStorage.setItem('userSubscriptionPlan', subscription.plan_id);
      localStorage.setItem('userSubscription', JSON.stringify(subscription));
      localStorage.setItem('subscriptionLastUpdated', Date.now().toString());
    } else if (planId) {
      localStorage.setItem('userSubscriptionPlan', planId);
      localStorage.removeItem('userSubscription');
    } else {
      localStorage.removeItem('userSubscriptionPlan');
      localStorage.removeItem('userSubscription');
    }
  };

  return { updateCache };
};
