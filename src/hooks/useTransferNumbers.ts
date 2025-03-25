
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
  
  // Load transfer numbers when user or lastRefresh changes
  useEffect(() => {
    if (user) {
      console.log("User or refresh trigger changed, fetching transfer numbers");
      fetchTransferNumbers();
    } else {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user, lastRefresh, fetchTransferNumbers, setTransferNumbers, setIsLoading, setError]);
  
  // Add a maximum retry count for persistent loading issues
  useEffect(() => {
    let retryCount = 0;
    let retryInterval: number | undefined;
    
    // If loading has timed out but we're still in loading state
    if (hasTimedOut && isLoading) {
      retryInterval = window.setInterval(() => {
        retryCount++;
        
        if (retryCount <= 3) {
          console.log(`Auto-retry attempt ${retryCount} for transfer numbers`);
          fetchTransferNumbers();
        } else {
          console.log("Maximum retry attempts reached, stopping auto-retry");
          window.clearInterval(retryInterval);
          
          // Force loading state to false as a last resort
          setIsLoading(false);
          
          toast({
            title: "Loading failed",
            description: "We couldn't load your transfer numbers after multiple attempts. Please try manually refreshing.",
            variant: "destructive"
          });
        }
      }, 10000); // Try every 10 seconds
    }
    
    return () => {
      if (retryInterval) {
        window.clearInterval(retryInterval);
      }
    };
  }, [hasTimedOut, isLoading, fetchTransferNumbers, setIsLoading]);
  
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
