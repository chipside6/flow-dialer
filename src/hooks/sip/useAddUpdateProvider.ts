
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { SipProvider } from "@/types/sipProviders";
import { useAuth } from "@/contexts/auth";
import { addSipProvider, updateSipProvider } from "@/services/customBackendService";

export const useAddUpdateProvider = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>,
  setEditingProvider: React.Dispatch<React.SetStateAction<SipProvider | null>>
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addOrUpdateProvider = async (provider: SipProvider) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to manage SIP providers.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isNewProvider = !provider.id;
      console.log(`${isNewProvider ? 'Adding' : 'Updating'} SIP provider:`, provider);
      
      let result;
      if (isNewProvider) {
        // For INSERT operations
        result = await addSipProvider(provider, user.id);
        
        // Add the new provider to the state
        setProviders(prevProviders => [...prevProviders, result]);
      } else {
        // For UPDATE operations
        result = await updateSipProvider(provider, user.id);
        
        // Update the provider in the list
        setProviders(providers.map(p => 
          p.id === provider.id ? { ...provider } : p
        ));
      }
      
      toast({
        title: isNewProvider ? "Provider Added" : "Provider Updated",
        description: `${provider.name} has been ${isNewProvider ? 'added' : 'updated'} successfully.`,
      });
      
      // Reset the editing state
      setEditingProvider(null);
    } catch (error: any) {
      console.error("Error saving SIP provider:", error);
      toast({
        title: "Error Saving Provider",
        description: error.message || "There was an error saving your SIP provider.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { isSubmitting, addOrUpdateProvider };
};
