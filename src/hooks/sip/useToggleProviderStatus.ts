
import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { toggleSipProviderStatus } from "@/services/customBackendService";

export const useToggleProviderStatus = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>
) => {
  const [isToggling, setIsToggling] = useState(false);
  const { user } = useAuth();
  
  const toggleProviderStatus = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update a provider",
        variant: "destructive",
      });
      return;
    }
    
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    const newStatus = !provider.isActive;

    try {
      setIsToggling(true);
      const success = await toggleSipProviderStatus(id, newStatus, user.id);

      if (success) {
        setProviders(providers.map(p => 
          p.id === id 
            ? { ...p, isActive: newStatus }
            : p
        ));
        
        toast({
          title: newStatus ? "Provider activated" : "Provider deactivated",
          description: `${provider.name} has been ${newStatus ? "activated" : "deactivated"}`,
        });
      }
    } catch (err: any) {
      console.error("Error toggling provider status:", err);
      toast({
        title: "Error updating provider",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleProviderStatus, isToggling };
};
