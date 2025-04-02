
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
  
  // Load transfer numbers just once when user or refresh trigger changes
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
  
  // Add a single retry for persistent loading issues
  useEffect(() => {
    let retryTimeout: number | undefined;
    
    // If loading has timed out but we're still in loading state
    if (hasTimedOut && isLoading && transferNumbers.length === 0) {
      retryTimeout = window.setTimeout(() => {
        console.log("Auto-retry for transfer numbers");
        fetchTransferNumbers();
      }, 3000); // Retry once after 3 seconds
    }
    
    return () => {
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [hasTimedOut, isLoading, transferNumbers.length, fetchTransferNumbers]);
  
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
