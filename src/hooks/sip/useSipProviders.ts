
import { useSipProvidersState } from "./useSipProvidersState";
import { useSipProviderActions } from "./useSipProviderActions";
import { UseSipProvidersReturn } from "./types";

export const useSipProviders = (): UseSipProvidersReturn => {
  const { 
    providers, 
    setProviders, 
    editingProvider, 
    setEditingProvider, 
    isLoading, 
    error 
  } = useSipProvidersState();
  
  const actions = useSipProviderActions(
    providers,
    setProviders,
    editingProvider,
    setEditingProvider
  );

  return {
    providers,
    editingProvider,
    isLoading,
    error,
    ...actions
  };
};
