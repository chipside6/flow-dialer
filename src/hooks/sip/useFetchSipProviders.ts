
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
        toast({
          title: "Error loading providers",
          description: err.message,
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
