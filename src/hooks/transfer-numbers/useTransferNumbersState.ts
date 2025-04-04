
import { useState, useCallback, useRef } from "react";
import { TransferNumber } from "@/types/transferNumber";

export function useTransferNumbersState() {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if this is the initial loading
  const initialLoadRef = useRef(true);
  
  // Check if this is the initial load
  const isInitialLoad = initialLoadRef.current;
  
  // Once loading completes for the first time, set initialLoad to false
  if (initialLoadRef.current && !isLoading) {
    initialLoadRef.current = false;
  }
  
  // Manual refresh function
  const refreshTransferNumbers = useCallback(async () => {
    console.log("Manually refreshing transfer numbers");
    setIsLoading(true);
    setError(null);
    setLastRefresh(Date.now());
    
    // Return a promise that will be resolved when the effect runs
    return new Promise<void>((resolve) => {
      // We resolve immediately since the actual fetch will happen in the effect
      // This allows callers to await this function
      resolve();
    });
  }, []);
  
  return {
    transferNumbers,
    setTransferNumbers,
    isLoading,
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    lastRefresh,
    error,
    setError,
    isInitialLoad,
    refreshTransferNumbers
  };
}
