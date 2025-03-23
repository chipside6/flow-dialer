import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { deleteSipProvider } from "@/services/supabase/sipProvidersService";

export const useDeleteProvider = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  const handleDeleteProvider = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a provider",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      const success = await deleteSipProvider(id, user.id);

      if (success) {
        setProviders(providers.filter(provider => provider.id !== id));
        toast({
          title: "Provider deleted",
          description: "The SIP provider has been removed",
        });
      }
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
