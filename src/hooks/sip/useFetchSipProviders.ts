
import { useState, useEffect } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchSipProviders } from "@/services/customBackendService";

export const useFetchSipProviders = () => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) {
        setProviders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchSipProviders(user.id);
        setProviders(data);
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        setError(err);
        
        // Improved error message based on error type
        const errorMessage = err.message || "An unexpected error occurred";
        const isNetworkError = errorMessage.includes("NetworkError") || 
                               errorMessage.includes("network") || 
                               errorMessage.includes("fetch") ||
                               !navigator.onLine;
        
        toast({
          title: "Error loading providers",
          description: isNetworkError 
            ? "Network connection error. Please check your internet connection and try again."
            : errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [user]);

  return { providers, setProviders, isLoading, error };
};
