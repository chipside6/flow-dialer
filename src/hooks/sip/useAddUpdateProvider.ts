
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
      console.log(`${isNewProvider ? 'Adding' : 'Updating'} SIP provider:`, provider);
      
      if (isNewProvider) {
        // For INSERT operations
        const { data, error } = await supabase
          .from('sip_providers')
          .insert({
            name: provider.name,
            host: provider.host,
            port: parseInt(provider.port),
            username: provider.username,
            password: provider.password,
            user_id: user.id,
            active: provider.isActive || false,
            // Note: description is not in the schema
          })
          .select();
        
        if (error) {
          console.error("Error inserting SIP provider:", error);
          throw error;
        }
        
        console.log("SIP provider inserted, response:", data);
        
        if (data && data.length > 0) {
          // Convert the returned data to match our SipProvider type
          const newProvider: SipProvider = {
            id: data[0].id,
            name: data[0].name,
            host: data[0].host,
            port: data[0].port.toString(),
            username: data[0].username,
            password: data[0].password,
            description: "", // Add empty description as it's required by type
            dateAdded: new Date(data[0].created_at),
            isActive: data[0].active
          };
          
          setProviders(prevProviders => [...prevProviders, newProvider]);
        }
      } else {
        // For UPDATE operations
        const { data, error } = await supabase
          .from('sip_providers')
          .update({
            name: provider.name,
            host: provider.host,
            port: parseInt(provider.port),
            username: provider.username,
            password: provider.password,
            active: provider.isActive,
            // Note: description is not in the schema
          })
          .eq('id', provider.id)
          .eq('user_id', user.id)
          .select();
        
        if (error) {
          console.error("Error updating SIP provider:", error);
          throw error;
        }
        
        console.log("SIP provider updated, response:", data);
        
        // Update the provider in the list
        const updatedProviders = providers.map(p => 
          p.id === provider.id ? { ...provider } : p
        );
        
        setProviders(updatedProviders);
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
