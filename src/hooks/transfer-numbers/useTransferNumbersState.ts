
import { useState, useCallback, useRef, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";

export function useTransferNumbersState() {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  // Ref to track loading timeout
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up loading timeout detection
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a timeout that will trigger if loading takes too long
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.log("Loading timed out after 5 seconds");
          setHasTimedOut(true);
          // Don't set isLoading to false yet, we'll let the fetch functions handle that
        }
      }, 5000); // 5 seconds timeout
    } else {
      // Clear timeout when loading ends
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);
  
  const refreshTransferNumbers = useCallback(async () => {
    console.log("Manually refreshing transfer numbers");
    setIsLoading(true);
    setHasTimedOut(false);
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
    hasTimedOut,
    refreshTransferNumbers
  };
}
