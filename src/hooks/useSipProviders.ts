
import { useFetchSipProviders } from "./sip/useFetchSipProviders";
import { useProviderState } from "./sip/useProviderState";
import { useAddUpdateProvider } from "./sip/useAddUpdateProvider";
import { useDeleteProvider } from "./sip/useDeleteProvider";
import { useToggleProviderStatus } from "./sip/useToggleProviderStatus";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export const useSipProviders = () => {
  const { providers, setProviders, isLoading, error, refetch } = useFetchSipProviders();
  const { editingProvider, handleEditProvider, handleCancelEdit, setEditingProvider } = useProviderState();
  const { isSubmitting, addOrUpdateProvider } = useAddUpdateProvider(providers, setProviders, setEditingProvider);
  const { handleDeleteProvider } = useDeleteProvider(providers, setProviders);
  const { toggleProviderStatus } = useToggleProviderStatus(providers, setProviders);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Mark as initially loaded once loading completes
  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading, hasInitiallyLoaded]);

  // Add a timeout to prevent infinite loading state
  useEffect(() => {
    if (!isLoading) return;

    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("SIP providers loading timeout reached");
        // Force refetch to attempt data retrieval again
        refetch();
        
        // Show toast to inform user
        toast({
          title: "Loading is taking longer than expected",
          description: "We're attempting to reload your SIP providers. Please wait or try refreshing the page.",
          variant: "default",
        });
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [isLoading, refetch]);

  // Add a second, longer timeout to force reset loading state if nothing happens
  useEffect(() => {
    if (!isLoading) return;
    
    const finalTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("SIP providers loading final timeout reached - forcing state reset");
        // Force a refetch and reset loading indicators in the UI
        refetch();
        toast({
          title: "Unable to load providers",
          description: "We couldn't load your SIP providers. Please refresh the page or try again later.",
          variant: "destructive",
        });
      }
    }, 20000); // 20 seconds timeout

    return () => clearTimeout(finalTimeout);
  }, [isLoading, refetch]);

  return {
    // Data
    providers,
    editingProvider,
    isLoading,
    hasInitiallyLoaded, // Add this so components can know if initial load completed
    error,
    
    // Actions
    refetch,
    handleAddProvider: addOrUpdateProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  };
};
