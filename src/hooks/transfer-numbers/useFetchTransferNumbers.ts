
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { fetchUserTransferNumbers } from "@/services/transferNumberService";
import { supabase } from "@/integrations/supabase/client";

export function useFetchTransferNumbers(
  setTransferNumbers: (numbers: any[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) {
  const { user } = useAuth();

  // Fetch transfer numbers from Supabase
  const fetchTransferNumbers = useCallback(async () => {
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session || !user) {
      console.log("No authenticated session found, not fetching transfer numbers");
      setTransferNumbers([]);
      setIsLoading(false);
      setError("Please log in to access your transfer numbers");
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
    } catch (error: any) {
      console.error("Error fetching transfer numbers:", error);
      
      let errorMessage = "Failed to load transfer numbers";
      
      // Handle specific error cases
      if (error.message?.includes("Authentication required")) {
        errorMessage = "Please log in to access your transfer numbers";
      } else if (error.code === "PGRST301") {
        errorMessage = "Permission denied. You don't have access to these records.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error loading transfer numbers",
        description: errorMessage,
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
