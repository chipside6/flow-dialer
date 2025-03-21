
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { SipProvider } from "@/types/sipProviders";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

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
      const endpoint = isNewProvider ? 'insert' : 'update';
      const match = isNewProvider ? undefined : { id: provider.id };
      
      const { data, error } = await supabase
        .from('sip_providers')
        [endpoint]({
          name: provider.name,
          host: provider.host,
          port: parseInt(provider.port),
          username: provider.username,
          password: provider.password,
          user_id: user.id,
          active: provider.isActive,
          // Don't try to save description since it's not in the schema
        })
        .match(match)
        .select();
      
      if (error) throw error;
      
      toast({
        title: isNewProvider ? "Provider Added" : "Provider Updated",
        description: `${provider.name} has been ${isNewProvider ? 'added' : 'updated'} successfully.`,
      });
      
      if (isNewProvider && data) {
        // Convert the returned data to match our SipProvider type
        const newProviders = [...providers, {
          id: data[0].id as string,
          name: data[0].name,
          host: data[0].host,
          port: data[0].port.toString(),
          username: data[0].username,
          password: data[0].password,
          dateAdded: new Date(data[0].created_at),
          isActive: data[0].active
        }];
        
        setProviders(newProviders);
      } else {
        // Update the provider in the list
        const updatedProviders = providers.map(p => 
          p.id === provider.id ? { ...provider } : p
        );
        
        setProviders(updatedProviders);
      }
      
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
