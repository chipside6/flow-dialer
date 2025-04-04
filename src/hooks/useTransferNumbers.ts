
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
  const initialFetchDone = useRef(false);
  
  // Function to fetch transfer numbers - defined outside useEffect to avoid recreation
  const fetchData = useCallback(async () => {
    // Only fetch if authenticated and we have a user
    if (!isAuthenticated || !user?.id) {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    if (isLoading) return; // Prevent concurrent fetches
    
    console.log("useTransferNumbers: Fetching transfer numbers for user", user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchUserTransferNumbers(user.id);
      console.log(`useTransferNumbers: Fetched ${data.length} transfer numbers`);
      setTransferNumbers(data);
    } catch (err: any) {
      console.error("useTransferNumbers: Error fetching transfer numbers:", err);
      setError(err.message || "Failed to load transfer numbers");
    } finally {
      setIsLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [user?.id, isAuthenticated, isLoading, isInitialLoad]);
  
  // Memoized refresh function that doesn't change on every render
  const refreshTransferNumbers = useCallback(() => {
    // Only trigger a fetch if we haven't already fetched or explicitly request a refresh
    if (!initialFetchDone.current || !isLoading) {
      initialFetchDone.current = true;
      fetchData();
    }
  }, [fetchData, isLoading]);
  
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
      
      // Update local state immediately for better UX
      setTransferNumbers(prev => [newTransferNumber, ...prev]);
      
      return newTransferNumber;
    } catch (err: any) {
      console.error("useTransferNumbers: Error adding transfer number:", err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, user, setTransferNumbers]);
  
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
      
      // Update local state immediately for better UX
      if (success) {
        setTransferNumbers(prev => prev.filter(item => item.id !== id));
      }
      
      return success;
    } catch (err: any) {
      console.error("useTransferNumbers: Error deleting transfer number:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, user, setTransferNumbers]);
  
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
