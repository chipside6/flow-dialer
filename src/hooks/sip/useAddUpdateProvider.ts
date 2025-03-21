
import { useState } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

type ProviderInput = Omit<SipProvider, "id" | "dateAdded" | "isActive">;

export const useAddUpdateProvider = (
  providers: SipProvider[],
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>,
  setEditingProvider: React.Dispatch<React.SetStateAction<SipProvider | null>>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const handleAddProvider = async (provider: ProviderInput) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        throw new Error("You must be logged in to add a provider");
      }
      
      // Check if we're updating (if provider has an id) or adding new
      const isUpdating = 'id' in provider && provider.id;
      
      if (isUpdating) {
        // Update existing provider
        const { error } = await supabase
          .from('sip_providers')
          .update({
            name: provider.name,
            host: provider.host,
            port: parseInt(provider.port),
            username: provider.username,
            password: provider.password,
            description: provider.description
          })
          .eq('id', (provider as SipProvider).id);

        if (error) throw error;

        // Update local state
        setProviders(providers.map(p => 
          p.id === (provider as SipProvider).id ? { ...p, ...provider } : p
        ));
        
        toast({
          title: "Provider updated",
          description: `${provider.name} has been updated successfully`,
        });
      } else {
        // Add new provider
        const { data, error } = await supabase
          .from('sip_providers')
          .insert({
            name: provider.name,
            host: provider.host,
            port: parseInt(provider.port),
            username: provider.username,
            password: provider.password,
            description: provider.description,
            user_id: user.id,
            active: true
          })
          .select('*')
          .single();

        if (error) throw error;

        const newProvider: SipProvider = {
          id: data.id,
          name: data.name,
          host: data.host,
          port: data.port.toString(),
          username: data.username,
          password: data.password,
          description: data.description || "",
          dateAdded: new Date(data.created_at),
          isActive: data.active
        };
        
        setProviders([...providers, newProvider]);
        
        toast({
          title: "Provider added",
          description: `${provider.name} has been added successfully`,
        });
      }
      
      // Clear editing state
      setEditingProvider(null);
    } catch (err: any) {
      console.error("Error saving SIP provider:", err);
      toast({
        title: "Error saving provider",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { handleAddProvider, isSubmitting };
};
