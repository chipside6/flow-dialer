
import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDeleteProvider = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteProvider = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('sip_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProviders(providers.filter(provider => provider.id !== id));
      toast({
        title: "Provider deleted",
        description: "The SIP provider has been removed",
      });
    } catch (err: any) {
      console.error("Error deleting SIP provider:", err);
      toast({
        title: "Error deleting provider",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { handleDeleteProvider, isDeleting };
};
