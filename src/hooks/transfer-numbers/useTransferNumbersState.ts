
import { useState, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

export function useTransferNumbersState() {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  
  // Force reset loading state after 10 seconds to prevent UI from getting stuck
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Loading timeout reached, resetting isLoading state");
        setIsLoading(false);
      }, 10000);
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      // Reset states when unmounting
      setIsLoading(false);
      setIsSubmitting(false);
    };
  }, [isLoading]);
  
  // Reset isSubmitting after 5 seconds to prevent it from getting stuck
  useEffect(() => {
    let submitTimeout: number | undefined;
    
    if (isSubmitting) {
      submitTimeout = window.setTimeout(() => {
        console.log("Submit timeout reached, resetting isSubmitting state");
        setIsSubmitting(false);
      }, 5000);
    }
    
    return () => {
      if (submitTimeout) {
        window.clearTimeout(submitTimeout);
      }
    };
  }, [isSubmitting]);

  // Function to trigger a refresh without additional API calls
  const refreshTransferNumbers = async () => {
    console.log("Refreshing transfer numbers");
    setLastRefresh(Date.now());
    return Promise.resolve();  // Return a resolved promise
  };

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
    refreshTransferNumbers
  };
}
