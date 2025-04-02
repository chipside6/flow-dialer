
import { useState, useCallback, useRef, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { usePollingInterval } from "@/hooks/usePollingInterval";
import { toast } from "@/components/ui/use-toast";

export function useTransferNumbersState() {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store the last refresh timestamp
  const lastRefreshRef = useRef<number>(Date.now());
  const timeoutTracker = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Create a derived state for lastRefresh
  const [lastRefresh, setLastRefresh] = useState(lastRefreshRef.current);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  // Set a loading timeout to prevent infinite loading states
  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      
      // Set a timeout to mark the loading as timed out after 5 seconds (reduced from 8s)
      // This allows the UI to show a different state after this time
      timeoutTracker.current = setTimeout(() => {
        console.log("Loading timeout reached, handling gracefully");
        setHasTimedOut(true);
        
        toast({
          title: "Loading timeout reached",
          description: "We're having trouble loading your transfer numbers. You can try refreshing.",
          variant: "destructive" 
        });
      }, 5000);
    } else {
      if (timeoutTracker.current) {
        clearTimeout(timeoutTracker.current);
        timeoutTracker.current = null;
      }
      
      // Reset the timeout state when loading completes
      setHasTimedOut(false);
    }
    
    // Set an extreme timeout that will forcibly reset the loading state
    // after 10 seconds (reduced from 15s), regardless of what happens
    const extremeTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Extreme loading timeout reached, forcing loading state to false");
        setIsLoading(false);
        setError("Connection timed out. Please try again later.");
      }
    }, 10000);
    
    return () => {
      if (timeoutTracker.current) {
        clearTimeout(timeoutTracker.current);
      }
      clearTimeout(extremeTimeout);
    };
  }, [isLoading]);
  
  // Function to trigger a refresh
  const refreshTransferNumbers = useCallback(async () => {
    // Clear any existing error since we're retrying
    setError(null);
    
    // Update the lastRefresh timestamp to trigger a new fetch
    lastRefreshRef.current = Date.now();
    setLastRefresh(lastRefreshRef.current);
    
    // Wait for the next tick to ensure the lastRefresh change propagates
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Return a promise that resolves when this completes
    return Promise.resolve();
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
