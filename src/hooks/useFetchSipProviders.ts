
import { useState, useCallback, useEffect } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { fetchSipProviders } from "@/services/supabase/sipProvidersService";

export const useFetchSipProviders = () => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) {
      setProviders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error("SIP provider fetch timeout reached");
        setIsLoading(false);
        setError(new Error("Fetch operation timed out. Please try again."));
      }, 8000); // 8 second timeout
      
      const data = await fetchSipProviders(user.id);
      
      // Clear timeout since fetch succeeded
      clearTimeout(timeoutId);
      
      setProviders(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching SIP providers:", err);
      setError(new Error(err.message || "Failed to load SIP providers"));
      setIsLoading(false);
      
      toast({
        title: "Error loading providers",
        description: err.message || "Could not load your SIP providers. Please try again.",
        variant: "destructive",
      });
    }
  }, [user]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Fetch on mount
  useEffect(() => {
    fetchData();
    
    // Add a fallback timeout to ensure loading state is reset
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.log("Forcing isLoading to false after timeout");
        setIsLoading(false);
      }
    }, 10000); // 10 second hard timeout
    
    return () => clearTimeout(fallbackTimer);
  }, [fetchData]);

  return { providers, setProviders, isLoading, error, refetch };
};
