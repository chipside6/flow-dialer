
import { useState, useEffect, useCallback } from "react";
import { fetchUserCallCount } from "./subscriptionApi";
import { useToast } from "@/components/ui/use-toast";

export const useSubscriptionLimit = (userId: string | undefined, planId: string | null) => {
  const { toast } = useToast();
  const [callCount, setCallCount] = useState<number>(0);
  const [showLimitDialog, setShowLimitDialog] = useState<boolean>(false);
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);
  const [trialExpired, setTrialExpired] = useState<boolean>(false);
  
  // Define call limits based on plan
  const callLimit = planId === 'free' ? 500 : 
                    planId === 'trial' ? 1000 : 
                    planId === 'lifetime' ? Infinity : 500;
  
  // Fetch call count
  useEffect(() => {
    if (!userId) return;
    
    const fetchCalls = async () => {
      try {
        const count = await fetchUserCallCount(userId);
        setCallCount(count);
        
        // Check if user has reached the limit
        if (count >= callLimit && planId !== 'lifetime') {
          setHasReachedLimit(true);
        } else {
          setHasReachedLimit(false);
        }
      } catch (error) {
        console.error("Error fetching call count:", error);
      }
    };
    
    fetchCalls();
  }, [userId, planId, callLimit]);
  
  // Check if the user's trial has expired
  useEffect(() => {
    // If not on trial plan, this doesn't apply
    if (planId !== 'trial') {
      setTrialExpired(false);
      return;
    }
    
    // For trial plans, we rely on the subscription logic to determine if it's expired
    // This will be handled in the useSubscription hook
  }, [planId]);
  
  const closeLimitDialog = useCallback(() => {
    setShowLimitDialog(false);
  }, []);
  
  const checkAndShowLimitDialog = useCallback(() => {
    if (hasReachedLimit) {
      setShowLimitDialog(true);
      return true; // Limit reached
    }
    return false; // Limit not reached
  }, [hasReachedLimit]);
  
  return {
    callCount,
    showLimitDialog,
    closeLimitDialog,
    hasReachedLimit,
    callLimit,
    checkAndShowLimitDialog,
    trialExpired
  };
};
