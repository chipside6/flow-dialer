
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { fetchUserTransferNumbers } from "@/services/customBackendService";

export function useFetchTransferNumbers(
  setTransferNumbers: (numbers: any[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) {
  const { user } = useAuth();

  // Fetch transfer numbers from the custom backend - using useCallback to prevent recreation
  const fetchTransferNumbers = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Setting isLoading to true");
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching transfer numbers for user:", user.id);
      const formattedData = await fetchUserTransferNumbers(user.id);
      
      console.log("Successfully fetched transfer numbers:", formattedData.length);
      setTransferNumbers(formattedData);
    } catch (error) {
      console.error("Error fetching transfer numbers:", error);
      setError("Failed to load transfer numbers");
      toast({
        title: "Error loading transfer numbers",
        description: "Could not load your transfer numbers from the backend server",
        variant: "destructive"
      });
      // Reset state on error to prevent stuck states
      setTransferNumbers([]);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  }, [user, setTransferNumbers, setIsLoading, setError]);

  return {
    fetchTransferNumbers
  };
}
