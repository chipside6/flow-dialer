
import { useState, useEffect } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useSipProviders = () => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [editingProvider, setEditingProvider] = useState<SipProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) {
        setProviders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sip_providers')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Transform data to match SipProvider interface
        const transformedData = (data || []).map((provider: any) => ({
          id: provider.id,
          name: provider.name,
          host: provider.host,
          port: provider.port.toString(),
          username: provider.username,
          password: provider.password,
          description: provider.description || "",
          dateAdded: new Date(provider.created_at),
          isActive: provider.active
        }));
        
        setProviders(transformedData);
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        setError(err);
        toast({
          title: "Error loading providers",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [user]);

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
      if (editingProvider) {
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
          .eq('id', editingProvider.id);

        if (error) throw error;

        // Update local state
        setProviders(providers.map(provider => 
          provider.id === editingProvider.id 
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
      setEditingProvider(null);
    }
  };
  
  const handleEditProvider = (provider: SipProvider) => {
    setEditingProvider(provider);
  };
  
  const handleCancelEdit = () => {
    setEditingProvider(null);
  };
  
  const handleDeleteProvider = async (id: string) => {
    try {
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
    }
  };
  
  const toggleProviderStatus = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    const newStatus = !provider.isActive;

    try {
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
    }
  };

  return {
    providers,
    editingProvider,
    isLoading,
    error,
    handleAddProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  };
};
