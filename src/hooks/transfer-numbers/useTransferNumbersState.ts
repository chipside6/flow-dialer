
import { useState, useEffect } from "react";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

export function useTransferNumbersState() {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  
  // Force reset loading state after 6 seconds to prevent UI from getting stuck
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        console.log("Loading timeout reached, resetting isLoading state");
        setIsLoading(false);
        
        // Only show toast if there were no transfer numbers loaded
        if (transferNumbers.length === 0) {
          toast({
            title: "Loading timeout reached",
            description: "We couldn't load your transfer numbers. Please try refreshing.",
            variant: "destructive"
          });
        }
      }, 10000); // Increased from 5000 to ensure data has time to load
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, transferNumbers.length]);
  
  // Reset isSubmitting after 5 seconds to prevent it from getting stuck
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
      }, 5000); // Increased from 3000 to give more time for submission
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
