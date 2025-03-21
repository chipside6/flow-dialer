
import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useToggleProviderStatus = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>
) => {
  const [isToggling, setIsToggling] = useState(false);
  
  const toggleProviderStatus = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    const newStatus = !provider.isActive;

    try {
      setIsToggling(true);
      const { error } = await supabase
        .from('sip_providers')
        .update({ active: newStatus })
        .eq('id', id);

      if (error) throw error;

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
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleProviderStatus, isToggling };
};
