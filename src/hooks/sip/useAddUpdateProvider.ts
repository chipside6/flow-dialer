
import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useAddUpdateProvider = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>,
  setEditingProvider: React.Dispatch<React.SetStateAction<SipProvider | null>>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      
      // Check if we're editing an existing provider
      const existingProvider = providers.find(p => p.id === providerData.id);
      
      if (existingProvider) {
        // Update existing provider
        const { error } = await supabase
          .from('sip_providers')
          .update({
            name: providerData.name,
            host: providerData.host,
            port: parseInt(providerData.port),
            username: providerData.username,
            password: providerData.password,
            description: providerData.description
          })
          .eq('id', existingProvider.id);

        if (error) throw error;

        // Update local state
        setProviders(providers.map(provider => 
          provider.id === existingProvider.id 
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
        const { data, error } = await supabase
          .from('sip_providers')
          .insert({
            name: providerData.name,
            host: providerData.host,
            port: parseInt(providerData.port),
            username: providerData.username,
            password: providerData.password,
            description: providerData.description,
            active: true,
            user_id: user.id
          })
          .select();

        if (error) throw error;

        const newProvider: SipProvider = {
          id: data[0].id,
          ...providerData,
          dateAdded: new Date(),
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
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setEditingProvider(null);
    }
  };

  return { handleAddProvider, isSubmitting };
};
