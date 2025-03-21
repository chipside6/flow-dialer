
import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";

export const useProviderState = () => {
  const [editingProvider, setEditingProvider] = useState<SipProvider | null>(null);
  
  const handleEditProvider = (provider: SipProvider) => {
    setEditingProvider(provider);
  };
  
  const handleCancelEdit = () => {
    setEditingProvider(null);
  };

  return {
    editingProvider,
    handleEditProvider,
    handleCancelEdit,
    setEditingProvider
  };
};
