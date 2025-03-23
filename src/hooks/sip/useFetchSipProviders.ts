
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
      const data = await fetchSipProviders(user.id);
      setProviders(data);
    } catch (err: any) {
      console.error("Error fetching SIP providers:", err);
      setError(new Error(err.message || "Failed to load SIP providers"));
      toast({
        title: "Error loading providers",
        description: "Could not load your SIP providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { providers, setProviders, isLoading, error, refetch };
};
