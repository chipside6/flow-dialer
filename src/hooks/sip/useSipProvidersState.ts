
import { useState, useEffect, useRef } from "react";
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
  const mounted = useRef(true);

  useEffect(() => {
    console.log("useSipProvidersState effect running, user:", !!user);
    mounted.current = true;
    
    const loadProviders = async () => {
      if (!mounted.current) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (!user) {
          console.log("No user, clearing providers");
          if (mounted.current) {
            setProviders([]);
            setIsLoading(false);
          }
          return;
        }
        
        console.log("Fetching providers for user:", user.id);
        const data = await fetchSipProviders(user.id);
        console.log("Raw data from API:", data);
        
        if (!mounted.current) return;
        
        // If no data was returned, set an empty array (this is a valid state)
        if (!data || data.length === 0) {
          console.log("No providers found, setting empty array");
          setProviders([]);
        } else {
          const transformedData = transformProviderData(data);
          console.log("Transformed providers:", transformedData);
          setProviders(transformedData);
        }
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        if (mounted.current) {
          setError(err);
          toast({
            title: "Error loading providers",
            description: err.message || "Failed to load SIP providers",
            variant: "destructive"
          });
        }
      } finally {
        // Always set loading to false when done if component is still mounted
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };

    loadProviders();

    return () => {
      console.log("Cleanup effect in useSipProvidersState");
      mounted.current = false;
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
