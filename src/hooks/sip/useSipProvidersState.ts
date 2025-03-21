
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
    console.log("useSipProvidersState effect running, user:", !!user);
    let isMounted = true;
    
    const loadProviders = async () => {
      try {
        if (!user) {
          console.log("No user, clearing providers");
          if (isMounted) {
            setProviders([]);
            setError(null);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          console.log("Setting loading to true");
          setIsLoading(true);
        }
        
        console.log("Fetching providers for user:", user.id);
        const data = await fetchSipProviders(user.id);
        const transformedData = transformProviderData(data);
        console.log("Providers fetched:", transformedData.length);
        
        if (isMounted) {
          console.log("Setting providers and clearing error");
          setProviders(transformedData);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        if (isMounted) {
          console.log("Setting error and clearing loading");
          setError(err);
          setIsLoading(false);
          toast({
            title: "Error loading providers",
            description: err.message || "Failed to load SIP providers",
            variant: "destructive"
          });
        }
      }
    };

    loadProviders();

    return () => {
      console.log("Cleanup effect in useSipProvidersState");
      isMounted = false;
    };
  }, [user]);

  // Log current state for debugging
  console.log("useSipProvidersState - isLoading:", isLoading, "providers:", providers.length);

  return {
    providers,
    setProviders,
    editingProvider,
    setEditingProvider,
    isLoading,
    error,
  };
};
