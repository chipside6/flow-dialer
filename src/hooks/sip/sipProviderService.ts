import { supabase } from "@/integrations/supabase/client";
import { SipProvider } from "@/types/sipProviders";
import { SipProviderApiResponse } from "./types";

export const fetchSipProviders = async (userId: string) => {
  console.log("Fetching SIP providers for user:", userId);
  
  try {
    const { data, error } = await supabase
      .from('sip_providers')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Supabase error fetching providers:", error);
      throw new Error(error.message || "Failed to fetch SIP providers");
    }
    
    console.log("Providers fetched successfully:", data?.length || 0, data);
    
    // Return an empty array if no data was found
    return data || [];
  } catch (error: any) {
    console.error("Error in fetchSipProviders:", error);
    throw new Error(error.message || "Failed to fetch SIP providers");
  }
};

export const transformProviderData = (apiData: SipProviderApiResponse[]): SipProvider[] => {
  if (!apiData || !Array.isArray(apiData)) {
    console.warn("Invalid API data received:", apiData);
    return [];
  }
  
  return apiData.map((provider) => ({
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
};

export const addSipProvider = async (
  userId: string,
  providerData: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>
) => {
  console.log("Adding new SIP provider for user:", userId);
  
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
      user_id: userId
    })
    .select();

  if (error) {
    console.error("Supabase error adding provider:", error);
    throw new Error(error.message || "Failed to add SIP provider");
  }
  
  if (!data || data.length === 0) {
    throw new Error("No data returned after adding provider");
  }
  
  console.log("Provider added successfully:", data[0].id);
  return data[0] as SipProviderApiResponse;
};

export const updateSipProvider = async (
  providerId: string,
  providerData: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>
) => {
  console.log("Updating SIP provider:", providerId);
  
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
    .eq('id', providerId);

  if (error) {
    console.error("Supabase error updating provider:", error);
    throw new Error(error.message || "Failed to update SIP provider");
  }
  
  console.log("Provider updated successfully");
};

export const deleteSipProvider = async (providerId: string) => {
  console.log("Deleting SIP provider:", providerId);
  
  const { error } = await supabase
    .from('sip_providers')
    .delete()
    .eq('id', providerId);

  if (error) {
    console.error("Supabase error deleting provider:", error);
    throw new Error(error.message || "Failed to delete SIP provider");
  }
  
  console.log("Provider deleted successfully");
};

export const updateProviderStatus = async (providerId: string, status: boolean) => {
  console.log("Updating provider status:", providerId, "to", status);
  
  const { error } = await supabase
    .from('sip_providers')
    .update({ active: status })
    .eq('id', providerId);

  if (error) {
    console.error("Supabase error updating provider status:", error);
    throw new Error(error.message || "Failed to update provider status");
  }
  
  console.log("Provider status updated successfully");
};
