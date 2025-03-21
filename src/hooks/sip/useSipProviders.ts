import { useState } from "react";
import { useSipProvidersState } from "./useSipProvidersState";
import { useSipProviderActions } from "./useSipProviderActions";
import { UseSipProvidersReturn } from "./types";

export const useSipProviders = (): UseSipProvidersReturn => {
  const { providers, editingProvider, isLoading, error } = useSipProvidersState();
  const [providersState, setProvidersState] = useState(providers);
  const [editingProviderState, setEditingProviderState] = useState(editingProvider);
  
  // Keep local state in sync with the fetched state
  if (providers !== providersState) {
    setProvidersState(providers);
  }
  
  if (editingProvider !== editingProviderState) {
    setEditingProviderState(editingProvider);
  }
  
  const actions = useSipProviderActions(
    providersState,
    setProvidersState,
    editingProviderState,
    setEditingProviderState
  );

  return {
    providers: providersState,
    editingProvider: editingProviderState,
    isLoading,
    error,
    ...actions
  };
};
