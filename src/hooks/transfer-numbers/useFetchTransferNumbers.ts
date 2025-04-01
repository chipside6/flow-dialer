
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
        // Fetch transfer numbers
        const data = await fetchUserTransferNumbers(user.id);
        
        setTransferNumbers(data);
        console.log(`Successfully fetched ${data.length} transfer numbers`);
        return data;
      } catch (err: any) {
        console.error("Error fetching transfer numbers:", err);
        const errorMessage = err.message || "Failed to load transfer numbers";
        setError(errorMessage);
        
        // Provide user-friendly error feedback
        if (errorMessage.includes("timed out")) {
          toast({
            title: "Request timed out",
            description: "We couldn't load your transfer numbers in time. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error loading transfer numbers",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        // Set empty array for safety
        setTransferNumbers([]);
        throw err;
      }
    },
    {
      cacheKey: user?.id ? `transfer-numbers-${user.id}` : undefined,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      enabled: false, // Don't fetch automatically, we'll call it explicitly
      retry: 2,
      retryDelay: 2000,
      onSuccess: () => setIsLoading(false),
      onError: () => setIsLoading(false)
    }
  );

  // Return the fetch function
  return { 
    fetchTransferNumbers: useCallback(() => {
      setIsLoading(true);
      fetchTransferNumbers(true);
    }, [fetchTransferNumbers, setIsLoading])
  };
};
