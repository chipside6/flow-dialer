
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
  const { user, isAuthenticated } = useAuth();
  
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
    if (!isAuthenticated) {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // Prevent multiple concurrent fetches
    if (!isLoading && user) {
      console.log("User or refresh trigger changed, fetching transfer numbers");
      setIsLoading(true);
      fetchTransferNumbers();
    }
  }, [user, lastRefresh, isAuthenticated]);
  
  // Add a timeout to automatically set loading to false if it takes too long
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        if (isLoading) {
          console.log("Loading timed out after 10 seconds, forcing state to false");
          setIsLoading(false);
          if (!error && transferNumbers.length === 0) {
            setError("Failed to load transfer numbers. Please try again later.");
          }
        }
      }, 10000); // 10 second timeout
    }
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLoading, error, transferNumbers.length]);
  
  // Add explicit refresh function that bypasses cache
  const forceRefreshTransferNumbers = async () => {
    console.log("Force refreshing transfer numbers");
    setIsLoading(true);
    setError(null);
    
    try {
      await refreshTransferNumbers();
    } catch (error) {
      console.error("Error during force refresh:", error);
      setIsLoading(false);
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
