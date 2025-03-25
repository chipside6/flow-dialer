
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
  const { user } = useAuth();

  const fetchTransferNumbers = useCallback(async () => {
    if (!user) {
      console.log("No authenticated user, can't fetch transfer numbers");
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log(`Fetching transfer numbers for user: ${user.id}`);
    setIsLoading(true);
    setError(null);

    try {
      // Set up a timeout for the fetch operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timed out. Please try again."));
        }, 8000); // 8 second timeout
      });

      // Race between the actual fetch and the timeout
      const data = await Promise.race([
        fetchUserTransferNumbers(user.id),
        timeoutPromise
      ]) as TransferNumber[];
      
      setTransferNumbers(data);
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
      
      // Still clear loading state when error occurs
      setIsLoading(false);
      
      // Return empty array for safety
      setTransferNumbers([]);
    } finally {
      // Ensure loading state is cleared
      setIsLoading(false);
    }
  }, [user, setTransferNumbers, setIsLoading, setError]);

  return { fetchTransferNumbers };
};
