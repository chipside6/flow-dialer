
import { useFetchSipProviders } from "./sip/useFetchSipProviders";
import { useProviderState } from "./sip/useProviderState";
import { useAddUpdateProvider } from "./sip/useAddUpdateProvider";
import { useDeleteProvider } from "./sip/useDeleteProvider";
import { useToggleProviderStatus } from "./sip/useToggleProviderStatus";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export const useSipProviders = () => {
  const { providers, setProviders, isLoading, error, refetch } = useFetchSipProviders();
  const { editingProvider, handleEditProvider, handleCancelEdit, setEditingProvider } = useProviderState();
  const { isSubmitting, addOrUpdateProvider } = useAddUpdateProvider(providers, setProviders, setEditingProvider);
  const { handleDeleteProvider } = useDeleteProvider(providers, setProviders);
  const { toggleProviderStatus } = useToggleProviderStatus(providers, setProviders);

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
          description: "We're still trying to load your SIP providers. Please wait a moment.",
          variant: "default",
        });
      }
    }, 12000); // 12 seconds timeout

    return () => clearTimeout(timeout);
  }, [isLoading, refetch]);

  return {
    // Data
    providers,
    editingProvider,
    isLoading,
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
