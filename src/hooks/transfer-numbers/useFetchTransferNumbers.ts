import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchUserTransferNumbers } from "@/services/supabase/transferNumbersService";
import { TransferNumber } from "@/types/transferNumber";

interface UseFetchTransferNumbers {
  setTransferNumbers: (transferNumbers: TransferNumber[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useFetchTransferNumbers = ({
  setTransferNumbers,
  setIsLoading,
  setError,
}: UseFetchTransferNumbers) => {
  const { user } = useAuth();

  const fetchTransferNumbers = useCallback(async () => {
    if (!user) {
      setTransferNumbers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUserTransferNumbers(user.id);
      setTransferNumbers(data);
    } catch (err: any) {
      console.error("Error fetching transfer numbers:", err);
      setError(new Error(err.message || "Failed to load transfer numbers"));
    } finally {
      setIsLoading(false);
    }
  }, [user, setTransferNumbers, setIsLoading, setError]);

  return { fetchTransferNumbers };
};
