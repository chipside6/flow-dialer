
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchUserTransferNumbers } from "@/services/supabase/transferNumbersService";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

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

  const fetchTransferNumbers = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("No authenticated user, can't fetch transfer numbers");
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log(`Fetching transfer numbers for user: ${user.id}`);
    setIsLoading(true);
    setError(null);

    // Create a controller to be able to abort the fetch
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      // Set up a timeout for the fetch operation
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error("Request timed out. Please try again.");
      }, 15000); // 15 second timeout - increased from 8 seconds

      // Fetch transfer numbers - passing only user.id since the service doesn't accept signal
      const data = await fetchUserTransferNumbers(user.id);
      
      // Clear timeout since fetch completed successfully
      clearTimeout(timeoutId);
      
      setTransferNumbers(data);
      console.log(`Successfully fetched ${data.length} transfer numbers`);
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
    } finally {
      // Ensure loading state is cleared
      setIsLoading(false);
    }
  }, [user, isAuthenticated, setTransferNumbers, setIsLoading, setError]);

  return { fetchTransferNumbers };
};
