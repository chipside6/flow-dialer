
import { useState, useEffect, useRef } from "react";
import { SipProvider } from "@/types/sipProviders";
import { SipProviderState } from "./types";
import { fetchSipProviders, transformProviderData } from "./sipProviderService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

export const useSipProvidersState = (): SipProviderState => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [editingProvider, setEditingProvider] = useState<SipProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);  // Initialize as false, not true
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const mounted = useRef(true);

  useEffect(() => {
    // Clear the state when the component mounts to avoid stale data
    setProviders([]);
    setError(null);
    
    console.log("useSipProvidersState effect running, user:", !!user);
    mounted.current = true;
    
    const loadProviders = async () => {
      if (!mounted.current) return;
      
      try {
        // Set loading to true before fetching
        setIsLoading(true);
        setError(null);
        
        if (!user) {
          console.log("No user, clearing providers");
          setProviders([]);
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching providers for user:", user.id);
        const data = await fetchSipProviders(user.id);
        console.log("Raw data from API:", data);
        
        // Guard against component unmounting during fetch
        if (!mounted.current) return;
        
        // Process the data
        if (!data || data.length === 0) {
          console.log("No providers found, setting empty array");
          setProviders([]);
        } else {
          const transformedData = transformProviderData(data);
          console.log("Transformed providers:", transformedData);
          setProviders(transformedData);
        }
        
        // Clear any existing errors
        setError(null);
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        if (mounted.current) {
          setError(err instanceof Error ? err : new Error(err.message || "Unknown error"));
          toast({
            title: "Error loading providers",
            description: err.message || "Failed to load SIP providers",
            variant: "destructive"
          });
        }
      } finally {
        // Always set loading to false if component is still mounted
        if (mounted.current) {
          console.log("Setting isLoading to false");
          setIsLoading(false);
        }
      }
    };

    // Only load if user is available
    if (user) {
      loadProviders();
    } else {
      // Clear loading state if no user
      setIsLoading(false);
    }

    return () => {
      console.log("Cleanup effect in useSipProvidersState");
      mounted.current = false;
    };
  }, [user]);

  // Additional debug log to help diagnose issues
  console.log("useSipProvidersState current state:", { 
    isLoading, 
    providersCount: providers.length, 
    hasError: !!error 
  });

  return {
    providers,
    setProviders,
    editingProvider,
    setEditingProvider,
    isLoading,
    error,
  };
};
