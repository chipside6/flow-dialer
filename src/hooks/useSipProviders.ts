
import { useFetchSipProviders } from "./sip/useFetchSipProviders";
import { useProviderState } from "./sip/useProviderState";
import { useAddUpdateProvider } from "./sip/useAddUpdateProvider";
import { useDeleteProvider } from "./sip/useDeleteProvider";
import { useToggleProviderStatus } from "./sip/useToggleProviderStatus";

export const useSipProviders = () => {
  const { providers, setProviders, isLoading, error } = useFetchSipProviders();
  const { editingProvider, handleEditProvider, handleCancelEdit, setEditingProvider } = useProviderState();
  const { isSubmitting, addOrUpdateProvider } = useAddUpdateProvider(providers, setProviders, setEditingProvider);
  const { handleDeleteProvider } = useDeleteProvider(providers, setProviders);
  const { toggleProviderStatus } = useToggleProviderStatus(providers, setProviders);

  return {
    // Data
    providers,
    editingProvider,
    isLoading,
    error,
    
    // Actions
    handleAddProvider: addOrUpdateProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  };
};
