
import { useState, useEffect } from "react";
import { SipProvider } from "@/types/sipProviders";
import { SipProviderState } from "./types";
import { fetchSipProviders, transformProviderData } from "./sipProviderService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

export const useSipProvidersState = (): SipProviderState => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [editingProvider, setEditingProvider] = useState<SipProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const loadProviders = async () => {
      if (!user) {
        if (isMounted) {
          setProviders([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setIsLoading(true);
        const data = await fetchSipProviders(user.id);
        const transformedData = transformProviderData(data);
        
        if (isMounted) {
          setProviders(transformedData);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        if (isMounted) {
          setError(err);
          toast({
            title: "Error loading providers",
            description: err.message,
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return {
    providers,
    setProviders,
    editingProvider,
    setEditingProvider,
    isLoading,
    error,
  };
};
