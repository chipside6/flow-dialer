
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
      // Set loading state at the beginning
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        if (!user) {
          console.log("No user, clearing providers");
          if (isMounted) {
            setProviders([]);
            setIsLoading(false);
          }
          return;
        }
        
        console.log("Fetching providers for user:", user.id);
        const data = await fetchSipProviders(user.id);
        console.log("Raw data from API:", data);
        
        if (!isMounted) return;
        
        if (!data || data.length === 0) {
          console.log("No providers found, setting empty array");
          setProviders([]);
        } else {
          const transformedData = transformProviderData(data);
          console.log("Transformed providers:", transformedData);
          setProviders(transformedData);
        }
        
        setError(null);
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        if (isMounted) {
          setError(err);
          toast({
            title: "Error loading providers",
            description: err.message || "Failed to load SIP providers",
            variant: "destructive"
          });
        }
      } finally {
        // Always set loading to false when done
        if (isMounted) {
          setIsLoading(false);
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
  console.log("useSipProvidersState - isLoading:", isLoading, "providers:", providers?.length);

  return {
    providers,
    setProviders,
    editingProvider,
    setEditingProvider,
    isLoading,
    error,
  };
};
