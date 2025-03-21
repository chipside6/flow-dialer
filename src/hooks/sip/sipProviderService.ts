
import { supabase } from "@/integrations/supabase/client";
import { SipProvider } from "@/types/sipProviders";
import { SipProviderApiResponse } from "./types";

export const fetchSipProviders = async (userId: string) => {
  const { data, error } = await supabase
    .from('sip_providers')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as SipProviderApiResponse[];
};

export const transformProviderData = (apiData: SipProviderApiResponse[]): SipProvider[] => {
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

  if (error) throw error;
  return data[0] as SipProviderApiResponse;
};

export const updateSipProvider = async (
  providerId: string,
  providerData: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>
) => {
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

  if (error) throw error;
};

export const deleteSipProvider = async (providerId: string) => {
  const { error } = await supabase
    .from('sip_providers')
    .delete()
    .eq('id', providerId);

  if (error) throw error;
};

export const updateProviderStatus = async (providerId: string, status: boolean) => {
  const { error } = await supabase
    .from('sip_providers')
    .update({ active: status })
    .eq('id', providerId);

  if (error) throw error;
};
