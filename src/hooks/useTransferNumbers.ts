
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
  
  // We should force refresh after adding a transfer number
  const { addTransferNumber } = useAddTransferNumber(
    setIsSubmitting,
    async () => {
      console.log("Force refreshing transfer numbers after add");
      // Clear any cached data
      await refreshTransferNumbers();
    }
  );
  
  const { handleDeleteTransferNumber } = useDeleteTransferNumber(
    async () => {
      console.log("Force refreshing transfer numbers after delete");
      // Clear any cached data
      await refreshTransferNumbers();
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
  
  // Add explicit refresh function that bypasses cache
  const forceRefreshTransferNumbers = async () => {
    console.log("Force refreshing transfer numbers");
    setIsLoading(true);
    setError(null);
    
    try {
      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshTransferNumbers();
    } catch (error) {
      console.error("Error during force refresh:", error);
    }
  };
  
  return {
    transferNumbers,
    isLoading,
    isSubmitting,
    error,
    addTransferNumber,
    deleteTransferNumber: handleDeleteTransferNumber,
    refreshTransferNumbers: forceRefreshTransferNumbers
  };
}
