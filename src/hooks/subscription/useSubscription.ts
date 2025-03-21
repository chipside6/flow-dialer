
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchSubscription, getPlanById } from "@/services/subscriptionService";
import { useSubscriptionLimit } from "./useSubscriptionLimit";
import { useLifetimePlan } from "./useLifetimePlan";
import { Subscription, UseSubscriptionReturn } from "./types";

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Fetch subscription data when component mounts and when user changes
  useEffect(() => {
    if (user) {
      console.log("User authenticated, fetching subscription data");
      fetchCurrentSubscription();
    } else {
      console.log("No user authenticated, resetting subscription state");
      setIsLoading(false);
      setCurrentPlan(null);
      setSubscription(null);
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    if (!user) {
      setIsLoading(false);
      setCurrentPlan('free');
      setSubscription(null);
      return null;
    }
    
    try {
      setIsLoading(true);
      
      const subscriptionData = await fetchSubscription(user.id);
      
      if (subscriptionData) {
        setCurrentPlan(subscriptionData.plan_id);
        setSubscription(subscriptionData);
      } else {
        setCurrentPlan('free');
        setSubscription(null);
      }
      
      setIsLoading(false);
      return subscriptionData;
    } catch (error) {
      console.error("Error in fetchCurrentSubscription:", error);
      setCurrentPlan('free');
      setSubscription(null);
      setIsLoading(false);
      return null;
    }
  };

  // Use the subscription limit hook
  const { 
    callCount, 
    showLimitDialog, 
    fetchCallCount, 
    closeLimitDialog 
  } = useSubscriptionLimit(user?.id, currentPlan);

  // Use the lifetime plan activation hook
  const { activateLifetimePlan } = useLifetimePlan(user?.id, fetchCurrentSubscription);

  return {
    isLoading,
    currentPlan,
    subscription,
    callCount,
    showLimitDialog,
    closeLimitDialog,
    fetchCurrentSubscription,
    activateLifetimePlan,
    getPlanById
  };
};
