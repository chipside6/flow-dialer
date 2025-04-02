
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

  // Use our cached fetch hook with optimized parameters
  const { refetch: fetchTransferNumbers, isLoading } = useCachedFetch(
    async () => {
      if (!isAuthenticated || !user) {
        console.log("No authenticated user, can't fetch transfer numbers");
        setTransferNumbers([]);
        setIsLoading(false);
        setError(null);
        return [];
      }

      console.log(`Fetching transfer numbers for user: ${user.id}`);
      
      try {
        // Set a timeout for the fetch operation (implemented at the service level)
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 8000); // 8 second timeout
        
        // Fetch transfer numbers
        const data = await fetchUserTransferNumbers(user.id, abortController.signal);
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        if (data && data.length > 0) {
          setTransferNumbers(data);
          console.log(`Successfully fetched ${data.length} transfer numbers`);
        } else {
          setTransferNumbers([]);
          console.log("No transfer numbers found");
        }
        
        setIsLoading(false);
        setError(null);
        return data;
      } catch (err: any) {
        console.error("Error fetching transfer numbers:", err);
        
        // Check if this is an AbortError (timeout)
        if (err.name === 'AbortError') {
          console.log('Fetch operation timed out');
          setError('Connection timed out. Please try again later.');
        } else {
          const errorMessage = err.message || "Failed to load transfer numbers";
          setError(errorMessage);
        }
        
        // Set empty array for safety
        setTransferNumbers([]);
        setIsLoading(false);
        
        // Only show toast for non-timeout errors to prevent UI clutter
        if (err.name !== 'AbortError') {
          toast({
            title: "Error loading transfer numbers",
            description: err.message || "Failed to load transfer numbers",
            variant: "destructive",
          });
        }
        
        return [];
      }
    },
    {
      cacheKey: user?.id ? `transfer-numbers-${user.id}` : undefined,
      cacheDuration: 15 * 1000, // 15 seconds (reduced from 30 seconds)
      enabled: false, // Don't fetch automatically, we'll call it explicitly
      retry: 1, // One retry is sufficient
      retryDelay: 500, // Reduced retry delay to 500ms
      onSuccess: () => setIsLoading(false),
      onError: () => setIsLoading(false)
    }
  );

  // Return the fetch function
  return { 
    fetchTransferNumbers: useCallback((signal?: AbortSignal) => {
      setIsLoading(true);
      fetchTransferNumbers(true);
    }, [fetchTransferNumbers, setIsLoading])
  };
};
