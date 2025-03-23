
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all SIP providers for a specific user
 */
export const fetchSipProviders = async (userId: string) => {
  console.log(`[SipProvidersService] Fetching SIP providers for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('sip_providers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[SipProvidersService] Error in fetchSipProviders:`, error);
      throw error;
    }
    
    console.log(`[SipProvidersService] Fetched ${data.length} SIP providers successfully`);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      host: item.host,
      port: item.port.toString(),
      username: item.username,
      password: item.password,
      description: item.description || "", // Handle potential undefined
      dateAdded: new Date(item.created_at),
      isActive: item.active
    }));
  } catch (error) {
    console.error(`[SipProvidersService] Error in fetchSipProviders:`, error);
    throw error;
  }
};

/**
 * Adds a new SIP provider
 */
export const addSipProvider = async (provider: any, userId: string) => {
  console.log(`[SipProvidersService] Adding SIP provider for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('sip_providers')
      .insert({
        user_id: userId,
        name: provider.name,
        host: provider.host,
        port: parseInt(provider.port),
        username: provider.username,
        password: provider.password,
        description: provider.description || null,
        active: provider.isActive || false
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[SipProvidersService] Error in addSipProvider:`, error);
      throw error;
    }
    
    console.log(`[SipProvidersService] Successfully added SIP provider:`, data);
    return {
      id: data.id,
      name: data.name,
      host: data.host,
      port: data.port.toString(),
      username: data.username,
      password: data.password,
      description: data.description || "", // Handle potential undefined
      dateAdded: new Date(data.created_at),
      isActive: data.active
    };
  } catch (error) {
    console.error(`[SipProvidersService] Error in addSipProvider:`, error);
    throw error;
  }
};

/**
 * Updates an existing SIP provider
 */
export const updateSipProvider = async (provider: any, userId: string) => {
  console.log(`[SipProvidersService] Updating SIP provider: ${provider.id}`);
  
  try {
    const { data, error } = await supabase
      .from('sip_providers')
      .update({
        name: provider.name,
        host: provider.host,
        port: parseInt(provider.port),
        username: provider.username,
        password: provider.password,
        description: provider.description || null,
        active: provider.isActive || false
      })
      .eq('id', provider.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error(`[SipProvidersService] Error in updateSipProvider:`, error);
      throw error;
    }
    
    console.log(`[SipProvidersService] Successfully updated SIP provider:`, data);
    return {
      id: data.id,
      name: data.name,
      host: data.host,
      port: data.port.toString(),
      username: data.username,
      password: data.password,
      description: data.description || "", // Handle potential undefined
      dateAdded: new Date(data.created_at),
      isActive: data.active
    };
  } catch (error) {
    console.error(`[SipProvidersService] Error in updateSipProvider:`, error);
    throw error;
  }
};

/**
 * Deletes a SIP provider
 */
export const deleteSipProvider = async (providerId: string, userId: string) => {
  console.log(`[SipProvidersService] Deleting SIP provider: ${providerId}`);
  
  try {
    const { error } = await supabase
      .from('sip_providers')
      .delete()
      .eq('id', providerId)
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[SipProvidersService] Error in deleteSipProvider:`, error);
      throw error;
    }
    
    console.log(`[SipProvidersService] Successfully deleted SIP provider: ${providerId}`);
    return true;
  } catch (error) {
    console.error(`[SipProvidersService] Error in deleteSipProvider:`, error);
    throw error;
  }
};

/**
 * Toggles a SIP provider's active status
 */
export const toggleSipProviderStatus = async (providerId: string, status: boolean, userId: string) => {
  console.log(`[SipProvidersService] Toggling SIP provider status: ${providerId} to ${status}`);
  
  try {
    const { error } = await supabase
      .from('sip_providers')
      .update({ active: status })
      .eq('id', providerId)
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[SipProvidersService] Error in toggleSipProviderStatus:`, error);
      throw error;
    }
    
    console.log(`[SipProvidersService] Successfully toggled SIP provider status: ${providerId}`);
    return true;
  } catch (error) {
    console.error(`[SipProvidersService] Error in toggleSipProviderStatus:`, error);
    throw error;
  }
};
