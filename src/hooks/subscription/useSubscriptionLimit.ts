
import { useState, useEffect } from "react";
import { fetchUserCallCount } from "@/services/subscriptionService";

export const useSubscriptionLimit = (
  userId: string | undefined, 
  currentPlan: string | null
) => {
  const [callCount, setCallCount] = useState<number>(0);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const fetchCallCount = async () => {
    if (!userId) return 0;
    
    const totalCalls = await fetchUserCallCount(userId);
    setCallCount(totalCalls);
    
    // Check if free user has reached limit
    if (currentPlan === 'free' && totalCalls >= 500) {
      setShowLimitDialog(true);
    }
    
    return totalCalls;
  };

  useEffect(() => {
    if (userId) {
      fetchCallCount();
    } else {
      setCallCount(0);
    }
  }, [userId, currentPlan]);

  const closeLimitDialog = () => {
    setShowLimitDialog(false);
  };

  return {
    callCount,
    showLimitDialog,
    fetchCallCount,
    closeLimitDialog
  };
};
