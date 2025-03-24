
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
    console.log("[useFetchTransferNumbers] Hook triggered.");

    if (!user) {
      console.warn("[useFetchTransferNumbers] No authenticated user.");
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log(`[useFetchTransferNumbers] Fetching transfer numbers for user: ${user.id}`);
    
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUserTransferNumbers(user.id);

      if (!data || data.length === 0) {
        console.warn("[useFetchTransferNumbers] No transfer numbers found.");
      } else {
        console.log(`[useFetchTransferNumbers] Retrieved ${data.length} transfer numbers.`);
      }

      setTransferNumbers(data);
    } catch (err: any) {
      console.error("[useFetchTransferNumbers] Error fetching transfer numbers:", err);
      setError(err.message || "Failed to load transfer numbers");
      toast({
        title: "Error loading transfer numbers",
        description: err.message || "Failed to load transfer numbers",
        variant: "destructive",
      });
      setTransferNumbers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, setTransferNumbers, setIsLoading, setError]);

  return { fetchTransferNumbers };
};
