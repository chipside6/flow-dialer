
import { useState, useEffect, useCallback } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

export function useTransferNumbersState() {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  // Reset timeout state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
    }
  }, [isLoading]);
  
  // Set a reasonable timeout for loading state
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Loading timeout reached, resetting isLoading state");
        setHasTimedOut(true);
        
        // Only show toast if there were no transfer numbers loaded
        if (transferNumbers.length === 0) {
          toast({
            title: "Loading is taking longer than expected",
            description: "We'll keep trying to load your transfer numbers in the background.",
            variant: "default"
          });
        }
      }, 8000); // Reduced from 15000 to 8000 ms
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, transferNumbers.length]);
  
  // Reset isSubmitting after timeout
  useEffect(() => {
    let submitTimeout: number | undefined;
    
    if (isSubmitting) {
      submitTimeout = window.setTimeout(() => {
        console.log("Submit timeout reached, resetting isSubmitting state");
        setIsSubmitting(false);
        toast({
          title: "Operation timed out",
          description: "The operation is taking longer than expected. Please check if it completed successfully.",
          variant: "destructive"
        });
      }, 7000); // Reduced from 10000 to 7000 ms
    }
    
    return () => {
      if (submitTimeout) {
        window.clearTimeout(submitTimeout);
      }
    };
  }, [isSubmitting]);

  // Hard reset loading after extreme timeout (safety mechanism)
  useEffect(() => {
    let extremeTimeoutId: number | undefined;
    
    if (isLoading) {
      extremeTimeoutId = window.setTimeout(() => {
        console.log("Extreme loading timeout reached, forcing loading state to false");
        setIsLoading(false);
        
        if (transferNumbers.length === 0) {
          toast({
            title: "Loading failed",
            description: "We couldn't load your transfer numbers. Please try refreshing the page.",
            variant: "destructive"
          });
        }
      }, 15000); // Reduced from 30000 to 15000 ms
    }
    
    return () => {
      if (extremeTimeoutId) {
        window.clearTimeout(extremeTimeoutId);
      }
    };
  }, [isLoading, transferNumbers.length]);

  // Function to trigger a refresh
  const refreshTransferNumbers = useCallback(async () => {
    console.log("Refreshing transfer numbers");
    setLastRefresh(Date.now());
    return Promise.resolve();  // Return a resolved promise
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
