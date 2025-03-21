
import { SipProvider } from "@/types/sipProviders";
import { SipProviderActions } from "./types";
import { 
  addSipProvider, 
  updateSipProvider, 
  deleteSipProvider, 
  updateProviderStatus 
} from "./sipProviderService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

export const useSipProviderActions = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>,
  editingProvider: SipProvider | null,
  setEditingProvider: React.Dispatch<React.SetStateAction<SipProvider | null>>
): SipProviderActions => {
  const { user } = useAuth();

  const handleAddProvider = async (providerData: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a provider",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingProvider) {
        // Update existing provider
        await updateSipProvider(editingProvider.id, providerData);

        // Update local state
        setProviders(providers.map(provider => 
          provider.id === editingProvider.id 
            ? {
                ...provider,
                ...providerData,
              }
            : provider
        ));
        
        toast({
          title: "Provider updated",
          description: `${providerData.name} has been updated successfully`,
        });
      } else {
        // Add new provider
        const newProviderData = await addSipProvider(user.id, providerData);

        const newProvider: SipProvider = {
          id: newProviderData.id,
          ...providerData,
          dateAdded: new Date(newProviderData.created_at),
          isActive: true
        };
        
        setProviders([...providers, newProvider]);
        
        toast({
          title: "Provider added",
          description: `${providerData.name} has been added successfully`,
        });
      }
    } catch (err: any) {
      console.error("Error saving SIP provider:", err);
      toast({
        title: "Error saving provider",
        description: err.message || "Failed to save SIP provider",
        variant: "destructive"
      });
    } finally {
      setEditingProvider(null);
    }
  };
  
  const handleEditProvider = (provider: SipProvider) => {
    setEditingProvider(provider);
  };
  
  const handleCancelEdit = () => {
    setEditingProvider(null);
  };
  
  const handleDeleteProvider = async (id: string) => {
    try {
      await deleteSipProvider(id);
      setProviders(providers.filter(provider => provider.id !== id));
      
      toast({
        title: "Provider deleted",
        description: "The SIP provider has been removed",
      });
    } catch (err: any) {
      console.error("Error deleting SIP provider:", err);
      toast({
        title: "Error deleting provider",
        description: err.message || "Failed to delete SIP provider",
        variant: "destructive"
      });
    }
  };
  
  const toggleProviderStatus = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    const newStatus = !provider.isActive;

    try {
      await updateProviderStatus(id, newStatus);
      
      setProviders(providers.map(p => 
        p.id === id 
          ? { ...p, isActive: newStatus }
          : p
      ));
      
      toast({
        title: newStatus ? "Provider activated" : "Provider deactivated",
        description: `${provider.name} has been ${newStatus ? "activated" : "deactivated"}`,
      });
    } catch (err: any) {
      console.error("Error toggling provider status:", err);
      toast({
        title: "Error updating provider",
        description: err.message || "Failed to update provider status",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  };
};
