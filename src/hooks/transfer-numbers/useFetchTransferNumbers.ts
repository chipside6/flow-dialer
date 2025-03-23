
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchUserTransferNumbers } from "@/services/supabase/transferNumbersService";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

interface UseFetchTransferNumbersState {
  setTransferNumbers: (transferNumbers: TransferNumber[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;  // Takes string, not Error
}

export const useFetchTransferNumbers = ({
  setTransferNumbers,
  setIsLoading,
  setError,
}: UseFetchTransferNumbersState) => {
  const { user } = useAuth();

  const fetchTransferNumbers = useCallback(async () => {
    if (!user) {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUserTransferNumbers(user.id);
      setTransferNumbers(data);
    } catch (err: any) {
      console.error("Error fetching transfer numbers:", err);
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
