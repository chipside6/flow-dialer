
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { TransferNumber } from "@/types/transferNumber";
import { useTransferNumbersState } from "./transfer-numbers/useTransferNumbersState";
import { useFetchTransferNumbers } from "./transfer-numbers/useFetchTransferNumbers";
import { useAddTransferNumber } from "./transfer-numbers/useAddTransferNumber";
import { useDeleteTransferNumber } from "./transfer-numbers/useDeleteTransferNumber";

export type { TransferNumber } from "@/types/transferNumber";

export function useTransferNumbers() {
  const { user } = useAuth();
  
  const {
    transferNumbers,
    setTransferNumbers,
    isLoading,
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    lastRefresh,
    error,
    setError,
    refreshTransferNumbers
  } = useTransferNumbersState();
  
  const { fetchTransferNumbers } = useFetchTransferNumbers({
    setTransferNumbers,
    setIsLoading,
    setError
  });
  
  const { addTransferNumber } = useAddTransferNumber(
    setIsSubmitting,
    refreshTransferNumbers
  );
  
  const { handleDeleteTransferNumber } = useDeleteTransferNumber(
    refreshTransferNumbers
  );
  
  // Load transfer numbers when user or lastRefresh changes
  useEffect(() => {
    if (user) {
      console.log("User or refresh trigger changed, fetching transfer numbers");
      fetchTransferNumbers();
    } else {
      setTransferNumbers([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user, lastRefresh, fetchTransferNumbers, setTransferNumbers, setIsLoading, setError]);
  
  return {
    transferNumbers,
    isLoading,
    isSubmitting,
    error,
    addTransferNumber,
    deleteTransferNumber: handleDeleteTransferNumber,
    refreshTransferNumbers
  };
}
