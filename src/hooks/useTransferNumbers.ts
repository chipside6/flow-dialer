
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { TransferNumber } from "@/types/transferNumber";
import { fetchUserTransferNumbers, addTransferNumber as addNumber, deleteTransferNumber as deleteNumber } from "@/services/supabase/transferNumbersService";
import { toast } from "@/components/ui/use-toast";

export type { TransferNumber } from "@/types/transferNumber";

export function useTransferNumbers() {
  const { user, isAuthenticated } = useAuth();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const initialFetchDone = useRef(false);
  
  // Function to force a refresh
  const refreshTransferNumbers = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // Load transfer numbers when user or refresh trigger changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Only fetch if authenticated and we have a user
      if (!isAuthenticated || !user?.id) {
        setTransferNumbers([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      
      // Prevent redundant fetches
      if (isLoading) return;
      
      console.log("useTransferNumbers: Fetching transfer numbers for user", user.id);
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchUserTransferNumbers(user.id);
        
        if (isMounted) {
          console.log(`useTransferNumbers: Fetched ${data.length} transfer numbers`);
          setTransferNumbers(data);
          setIsLoading(false);
          if (isInitialLoad) setIsInitialLoad(false);
        }
      } catch (err: any) {
        console.error("useTransferNumbers: Error fetching transfer numbers:", err);
        
        if (isMounted) {
          setError(err.message || "Failed to load transfer numbers");
          setIsLoading(false);
          if (isInitialLoad) setIsInitialLoad(false);
        }
      }
    };
    
    // Set a timeout to prevent hanging on loading state
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("useTransferNumbers: Loading timeout reached");
        setIsLoading(false);
        if (!error) {
          setError("Loading timed out. Please try again.");
        }
      }
    }, 8000);
    
    // Only fetch if we have a user and either:
    // 1. It's our initial fetch
    // 2. A refresh was triggered
    if (isAuthenticated && user?.id && (!initialFetchDone.current || refreshTrigger > 0)) {
      fetchData();
      initialFetchDone.current = true;
    }
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, user, refreshTrigger, isLoading, isInitialLoad, error]);
  
  // Add a new transfer number
  const addTransferNumber = useCallback(async (name: string, number: string, description: string) => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add transfer numbers",
        variant: "destructive"
      });
      return null;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTransferNumber = await addNumber(user.id, name, number, description);
      
      // Force refresh after adding
      refreshTransferNumbers();
      
      return newTransferNumber;
    } catch (err: any) {
      console.error("useTransferNumbers: Error adding transfer number:", err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, user, refreshTransferNumbers]);
  
  // Delete a transfer number
  const handleDeleteTransferNumber = useCallback(async (id: string) => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete transfer numbers",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await deleteNumber(user.id, id);
      
      // Force refresh after deletion
      if (success) {
        refreshTransferNumbers();
      }
      
      return success;
    } catch (err: any) {
      console.error("useTransferNumbers: Error deleting transfer number:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, user, refreshTransferNumbers]);
  
  return {
    transferNumbers,
    isLoading,
    isSubmitting,
    error,
    isInitialLoad,
    addTransferNumber,
    deleteTransferNumber: handleDeleteTransferNumber,
    refreshTransferNumbers
  };
}
