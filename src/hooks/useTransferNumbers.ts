
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { TransferNumber } from "@/types/transferNumber";
import { useTransferNumbersState } from "./transfer-numbers/useTransferNumbersState";
import { useFetchTransferNumbers } from "./transfer-numbers/useFetchTransferNumbers";
import { useAddTransferNumber } from "./transfer-numbers/useAddTransferNumber";
import { useDeleteTransferNumber } from "./transfer-numbers/useDeleteTransferNumber";
import { toast } from "@/components/ui/use-toast";

export type { TransferNumber } from "@/types/transferNumber";

export function useTransferNumbers() {
  const { user } = useAuth();
  
  const {
    transferNumbers,
    setTransferNumbers,
    isLoading,
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    lastRefresh,
    error,
    setError,
    hasTimedOut,
    retryCount,
    incrementRetry,
    refreshTransferNumbers
  } = useTransferNumbersState();
  
  const { fetchTransferNumbers } = useFetchTransferNumbers({
    setTransferNumbers,
    setIsLoading,
    setError
  });
  
  const { addTransferNumber } = useAddTransferNumber(
    setIsSubmitting,
    async () => {
      await refreshTransferNumbers(); // Return Promise
    }
  );
  
  const { handleDeleteTransferNumber } = useDeleteTransferNumber(
    async () => {
      await refreshTransferNumbers(); // Return Promise
    }
  );
  
  // Load transfer numbers when user or refresh trigger changes
  useEffect(() => {
    let isMounted = true;
    
    if (user) {
      // Prevent multiple concurrent fetches
      if (!isLoading) {
        console.log("User or refresh trigger changed, fetching transfer numbers");
        setIsLoading(true);
        fetchTransferNumbers();
      }
    } else {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, lastRefresh]);
  
  // Add progressive retry logic for persistent loading issues
  useEffect(() => {
    let retryTimeout: number | undefined;
    
    // If loading has timed out but we're still in loading state and under retry limit
    if (hasTimedOut && isLoading && transferNumbers.length === 0 && retryCount < 3) {
      // Exponential backoff: 1s, 2s, 4s
      const backoffDelay = Math.pow(2, retryCount) * 1000;
      
      retryTimeout = window.setTimeout(() => {
        console.log(`Auto-retry for transfer numbers (attempt ${retryCount + 1})`);
        incrementRetry();
        fetchTransferNumbers();
      }, backoffDelay);
      
      console.log(`Scheduled retry in ${backoffDelay}ms`);
    }
    
    return () => {
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [hasTimedOut, isLoading, transferNumbers.length, retryCount, fetchTransferNumbers, incrementRetry]);
  
  return {
    transferNumbers,
    isLoading,
    isSubmitting,
    error,
    addTransferNumber,
    deleteTransferNumber: handleDeleteTransferNumber,
    refreshTransferNumbers
  };
}
