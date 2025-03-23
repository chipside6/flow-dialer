import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { addSipProvider, updateSipProvider } from "@/services/supabase/sipProvidersService";

export const useAddUpdateProvider = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>,
  setEditingProvider: React.Dispatch<React.SetStateAction<SipProvider | null>>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const addOrUpdateProvider = async (provider: SipProvider) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add or update a provider",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (provider.id === 'new') {
        // Adding a new provider
        const newProvider = await addSipProvider(provider, user.id);
        setProviders([...providers, newProvider]);
        toast({
          title: "Provider added",
          description: "The SIP provider has been added successfully",
        });
      } else {
        // Updating an existing provider
        const updatedProvider = await updateSipProvider(provider, user.id);
        setProviders(
          providers.map(p => (p.id === provider.id ? updatedProvider : p))
        );
        toast({
          title: "Provider updated",
          description: "The SIP provider has been updated successfully",
        });
      }
      setEditingProvider(null);
    } catch (err: any) {
      console.error("Error adding/updating SIP provider:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { isSubmitting, addOrUpdateProvider };
};
