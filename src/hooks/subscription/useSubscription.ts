
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchSubscription, getPlanById } from "@/hooks/subscription/subscriptionApi";
import { useSubscriptionLimit } from "./useSubscriptionLimit";
import { useLifetimePlan } from "./useLifetimePlan";
import { Subscription, UseSubscriptionReturn } from "./types";
import { useToast } from "@/components/ui/use-toast";

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<Error | null>(null);

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
      setError(null);
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
      setError(null);
      
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
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      
      toast({
        title: "Subscription Error",
        description: "Could not retrieve your subscription information. Default free plan applied.",
        variant: "destructive"
      });
      
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
    getPlanById,
    error
  };
};
