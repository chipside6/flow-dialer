
import { useState, useEffect } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";

export const useSipProviders = () => {
  console.log("useSipProviders hook initialized");
  
  const [providers, setProviders] = useState<SipProvider[]>([
    {
      id: "1",
      name: "Twilio SIP",
      host: "sip.twilio.com",
      port: "5060",
      username: "AC123456789",
      password: "••••••••••",
      description: "Main Twilio SIP trunk for outbound calls",
      dateAdded: new Date(2023, 4, 15),
      isActive: true
    },
    {
      id: "2",
      name: "Vonage API",
      host: "sip.vonage.com",
      port: "5060",
      username: "vonage_user",
      password: "••••••••",
      description: "Vonage SIP trunk for international calls",
      dateAdded: new Date(2023, 5, 10),
      isActive: false
    }
  ]);

  useEffect(() => {
    console.log("Providers loaded:", providers.length);
  }, [providers]);

  const [editingProvider, setEditingProvider] = useState<SipProvider | null>(null);

  const handleAddProvider = (providerData: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>) => {
    console.log("Adding provider:", providerData);
    
    if (editingProvider) {
      // Update existing provider
      setProviders(providers.map(provider => 
        provider.id === editingProvider.id 
          ? {
              ...provider,
              ...providerData,
              password: providerData.password === "••••••••" ? provider.password : providerData.password,
            }
          : provider
      ));
      
      toast({
        title: "Provider updated",
        description: `${providerData.name} has been updated successfully`,
      });
    } else {
      // Add new provider
      const newProvider: SipProvider = {
        id: Date.now().toString(),
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
    
    setEditingProvider(null);
  };
  
  const handleEditProvider = (provider: SipProvider) => {
    console.log("Editing provider:", provider);
    setEditingProvider(provider);
  };
  
  const handleCancelEdit = () => {
    console.log("Canceling edit");
    setEditingProvider(null);
  };
  
  const handleDeleteProvider = (id: string) => {
    console.log("Deleting provider:", id);
    setProviders(providers.filter(provider => provider.id !== id));
    toast({
      title: "Provider deleted",
      description: "The SIP provider has been removed",
    });
  };
  
  const toggleProviderStatus = (id: string) => {
    console.log("Toggling provider status:", id);
    setProviders(providers.map(provider => 
      provider.id === id 
        ? { ...provider, isActive: !provider.isActive }
        : provider
    ));
    
    const provider = providers.find(p => p.id === id);
    if (provider) {
      toast({
        title: provider.isActive ? "Provider deactivated" : "Provider activated",
        description: `${provider.name} has been ${provider.isActive ? "deactivated" : "activated"}`,
      });
    }
  };

  return {
    providers,
    editingProvider,
    handleAddProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  };
};
