import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { toggleSipProviderStatus } from "@/services/supabase/sipProvidersService";

export const useToggleProviderStatus = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>
) => {
  const [isToggling, setIsToggling] = useState(false);
  const { user } = useAuth();
  
  const toggleProviderStatus = async (id: string, currentStatus: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to toggle a provider's status",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsToggling(true);
      const success = await toggleSipProviderStatus(id, !currentStatus, user.id);

      if (success) {
        setProviders(providers.map(provider =>
          provider.id === id ? { ...provider, isActive: !currentStatus } : provider
        ));
        toast({
          title: "Provider status updated",
          description: `SIP provider status has been toggled to ${!currentStatus ? 'active' : 'inactive'}`,
        });
      }
    } catch (err: any) {
      console.error("Error toggling SIP provider status:", err);
      toast({
        title: "Error toggling provider status",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };
  
  return { toggleProviderStatus, isToggling };
};
