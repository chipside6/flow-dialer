
import { useState, useEffect, useCallback } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchSipProviders } from "@/services/api/sipProvidersService";
import { 
  DialerErrorType, 
  createDialerError, 
  handleDialerError 
} from "@/utils/errorHandlingUtils";

export const useFetchSipProviders = () => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();

  const fetchProviders = useCallback(async () => {
    if (!user) {
      setProviders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSipProviders(user.id);
      setProviders(data);
    } catch (err: any) {
      console.error("Error fetching SIP providers:", err);
      setError(err);
      
      // Determine error type
      const isNetworkError = !navigator.onLine || 
                           err.message.includes("NetworkError") || 
                           err.message.includes("network") || 
                           err.message.includes("fetch") ||
                           err.message.includes("Failed to fetch");
      
      // Handle network error with appropriate error type
      handleDialerError(
        createDialerError(
          isNetworkError ? DialerErrorType.CONNECTION : DialerErrorType.SERVER,
          isNetworkError 
            ? "Unable to connect to the server. Please check your internet connection."
            : err.message || "An error occurred while loading SIP providers"
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, retryCount]);

  // Initial fetch and refetch when user or retryCount changes
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Function to manually retry fetching providers
  const refetch = useCallback(() => {
    setRetryCount(count => count + 1);
  }, []);

  return { providers, setProviders, isLoading, error, refetch };
};
