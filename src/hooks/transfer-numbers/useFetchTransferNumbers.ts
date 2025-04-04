
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchUserTransferNumbers } from "@/services/supabase/transferNumbersService";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";
import { useCachedFetch } from "@/hooks/useCachedFetch";

interface UseFetchTransferNumbersState {
  setTransferNumbers: (transferNumbers: TransferNumber[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFetchTransferNumbers = ({
  setTransferNumbers,
  setIsLoading,
  setError,
}: UseFetchTransferNumbersState) => {
  const { user, isAuthenticated } = useAuth();

  // Define function outside useCachedFetch to avoid recreation
  const fetchData = async () => {
    if (!isAuthenticated || !user) {
      console.log("No authenticated user, can't fetch transfer numbers");
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return [];
    }

    console.log(`Fetching transfer numbers for user: ${user.id}`);
    
    try {
      // Set a reasonable timeout for the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Fetch transfer numbers
      const data = await fetchUserTransferNumbers(user.id);
      
      clearTimeout(timeoutId);
      
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} transfer numbers`);
        setTransferNumbers(data);
      } else {
        console.log("No transfer numbers found");
        setTransferNumbers([]);
      }
      
      setIsLoading(false);
      setError(null);
      return data;
    } catch (err: any) {
      console.error("Error fetching transfer numbers:", err);
      
      // Check if this is an AbortError (timeout)
      if (err.name === 'AbortError') {
        setError('Connection timed out. Please try again later.');
      } else if (err.message?.includes('network') || err.message?.includes('connection')) {
        setError(`Network error: ${err.message || "Unable to connect to the server"}`);
      } else {
        setError(err.message || "Failed to load transfer numbers");
      }
      
      setTransferNumbers([]);
      setIsLoading(false);
      
      return [];
    }
  };

  // Use our cached fetch hook with optimized parameters
  const { refetch: fetchTransferNumbers, isLoading } = useCachedFetch(
    fetchData,
    {
      cacheKey: user?.id ? `transfer-numbers-${user.id}` : undefined,
      cacheDuration: 30 * 1000, // 30 seconds cache
      enabled: false, // Don't fetch automatically, we'll call it explicitly
      retry: 1, // One retry is sufficient
      retryDelay: 1000
    }
  );

  // Return the fetch function
  return { 
    fetchTransferNumbers: useCallback(() => {
      setIsLoading(true);
      fetchTransferNumbers();
    }, [fetchTransferNumbers, setIsLoading])
  };
};
