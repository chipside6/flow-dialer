
import { useState, useEffect, useCallback } from "react";
import { fetchUserCallCount, fetchUserDailyCallCount, fetchUserMonthlyCallCount } from "./subscriptionApi";
import { useToast } from "@/components/ui/use-toast";

export const useSubscriptionLimit = (userId: string | undefined, planId: string | null) => {
  const { toast } = useToast();
  const [callCount, setCallCount] = useState<number>(0);
  const [dailyCallCount, setDailyCallCount] = useState<number>(0);
  const [monthlyCallCount, setMonthlyCallCount] = useState<number>(0);
  const [showLimitDialog, setShowLimitDialog] = useState<boolean>(false);
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);
  
  // Define call limits based on plan
  const callLimit = planId === 'lifetime' ? Infinity : 0; // No calls for non-lifetime users
  const dailyCallLimit = planId === 'lifetime' ? Infinity : 0; // No calls for non-lifetime users
  const monthlyCallLimit = planId === 'lifetime' ? Infinity : 0; // No calls for non-lifetime users
  
  // Fetch call counts
  useEffect(() => {
    if (!userId) return;
    
    const fetchCalls = async () => {
      try {
        // Fetch total, daily, and monthly call counts
        const count = await fetchUserCallCount(userId);
        const dailyCount = await fetchUserDailyCallCount(userId);
        const monthlyCount = await fetchUserMonthlyCallCount(userId);
        
        setCallCount(count);
        setDailyCallCount(dailyCount);
        setMonthlyCallCount(monthlyCount);
        
        // Check if user has reached any limit
        if (planId !== 'lifetime') {
          setHasReachedLimit(true);
        } else {
          setHasReachedLimit(false);
        }
      } catch (error) {
        console.error("Error fetching call counts:", error);
      }
    };
    
    fetchCalls();
    
    // Set up a polling interval to refresh call counts periodically
    const interval = setInterval(fetchCalls, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [userId, planId, callLimit, dailyCallLimit, monthlyCallLimit]);
  
  const closeLimitDialog = useCallback(() => {
    setShowLimitDialog(false);
  }, []);
  
  // Updated to return a Promise<boolean> instead of a boolean
  const checkAndShowLimitDialog = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (hasReachedLimit) {
        setShowLimitDialog(true);
        resolve(true); // Limit reached
      } else {
        resolve(false); // Limit not reached
      }
    });
  }, [hasReachedLimit]);
  
  return {
    callCount,
    dailyCallCount,
    monthlyCallCount,
    showLimitDialog,
    closeLimitDialog,
    hasReachedLimit,
    callLimit,
    dailyCallLimit,
    monthlyCallLimit,
    checkAndShowLimitDialog
  };
};
