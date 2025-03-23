
import { apiFetch } from './apiConfig';
import { SipProvider } from '@/types/sipProviders';

/**
 * Fetches all SIP providers for a specific user
 */
export const fetchSipProviders = async (userId: string): Promise<SipProvider[]> => {
  console.log(`[SipProvidersService] Fetching SIP providers for user: ${userId}`);
  
  try {
    const data = await apiFetch<any[]>(`sip-providers?userId=${userId}`);
    console.log(`[SipProvidersService] Fetched ${data.length} SIP providers successfully`);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      host: item.host,
      port: item.port.toString(),
      username: item.username,
      password: item.password,
      description: item.description || "No description provided",
      dateAdded: new Date(item.created_at || item.dateAdded),
      isActive: item.active || item.isActive || false
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
    const data = await apiFetch('sip-providers', {
      method: 'POST',
      body: JSON.stringify({
        ...provider,
        user_id: userId
      })
    });
    
    console.log(`[SipProvidersService] Successfully added SIP provider:`, data);
    return data;
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
    const data = await apiFetch(`sip-providers/${provider.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...provider,
        user_id: userId
      })
    });
    
    console.log(`[SipProvidersService] Successfully updated SIP provider:`, data);
    return data;
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
    await apiFetch(`sip-providers/${providerId}?userId=${userId}`, {
      method: 'DELETE'
    });
    
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
    await apiFetch(`sip-providers/${providerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        active: status,
        user_id: userId
      })
    });
    
    console.log(`[SipProvidersService] Successfully toggled SIP provider status: ${providerId}`);
    return true;
  } catch (error) {
    console.error(`[SipProvidersService] Error in toggleSipProviderStatus:`, error);
    throw error;
  }
};
