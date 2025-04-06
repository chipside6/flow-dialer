
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
  const callLimit = planId === 'free' ? 1000 : Infinity; // 1000 for free users, unlimited for lifetime
  const dailyCallLimit = planId === 'free' ? 100 : Infinity; // 100 for free users, unlimited for lifetime
  const monthlyCallLimit = planId === 'free' ? 1000 : Infinity; // 1000 for free users, unlimited for lifetime
  
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
        if (
          (dailyCount >= dailyCallLimit || monthlyCount >= monthlyCallLimit) && 
          planId === 'free'
        ) {
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
  
  const checkAndShowLimitDialog = useCallback(() => {
    if (hasReachedLimit) {
      setShowLimitDialog(true);
      return true; // Limit reached
    }
    return false; // Limit not reached
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
