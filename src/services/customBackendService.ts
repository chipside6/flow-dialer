
import { getStoredSession } from "./authService";

// Replace with your custom backend URL
export const API_URL = 'http://localhost:3001/api';

/**
 * Helper function to add auth headers to requests
 */
const getAuthHeaders = (): Record<string, string> => {
  const session = getStoredSession();
  return session ? { 'Authorization': `Bearer ${session.user.id}` } : {};
};

/**
 * Fetches all transfer numbers for a specific user from the custom backend
 */
export const fetchUserTransferNumbers = async (userId: string) => {
  console.log(`[CustomBackendService] Fetching transfer numbers for user: ${userId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/transfer-numbers?userId=${userId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Fetched ${data.length} transfer numbers successfully`);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      number: item.phone_number || item.number,
      description: item.description || "No description provided",
      dateAdded: new Date(item.created_at || item.dateAdded),
      callCount: item.call_count !== null ? Number(item.call_count) : 0
    }));
  } catch (error) {
    console.error(`[CustomBackendService] Error in fetchUserTransferNumbers:`, error);
    throw error;
  }
};

/**
 * Adds a new transfer number to the custom backend
 */
export const addTransferNumber = async (
  userId: string, 
  name: string, 
  number: string, 
  description: string
) => {
  console.log(`[CustomBackendService] Adding transfer number for user: ${userId}`, {
    name,
    number,
    description: description ? "provided" : "empty"
  });
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    const response = await fetch(`${API_URL}/transfer-numbers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        name,
        phone_number: number,
        description: description || null,
        call_count: 0
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Insert successful:`, data);
    
    return {
      id: data.id || 'pending',
      name,
      number,
      description: description || "No description provided",
      dateAdded: new Date(),
      callCount: 0
    };
  } catch (error) {
    console.error(`[CustomBackendService] Error in addTransferNumber:`, error);
    throw error;
  }
};

/**
 * Deletes a transfer number from the custom backend
 */
export const deleteTransferNumber = async (
  userId: string, 
  transferNumberId: string
) => {
  console.log(`[CustomBackendService] Deleting transfer number ${transferNumberId} for user ${userId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/transfer-numbers/${transferNumberId}?userId=${userId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    console.log(`[CustomBackendService] Successfully deleted transfer number ${transferNumberId}`);
    return true;
  } catch (error) {
    console.error(`[CustomBackendService] Error in deleteTransferNumber:`, error);
    throw error;
  }
};

/**
 * SIP Providers management
 */
export const fetchSipProviders = async (userId: string) => {
  console.log(`[CustomBackendService] Fetching SIP providers for user: ${userId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/sip-providers?userId=${userId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Fetched ${data.length} SIP providers successfully`);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      host: item.host,
      port: item.port.toString(),
      username: item.username,
      password: item.password,
      description: item.description || "",
      dateAdded: new Date(item.created_at),
      isActive: item.active
    }));
  } catch (error) {
    console.error(`[CustomBackendService] Error in fetchSipProviders:`, error);
    throw error;
  }
};

export const addSipProvider = async (provider: any, userId: string) => {
  console.log(`[CustomBackendService] Adding SIP provider for user: ${userId}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    const response = await fetch(`${API_URL}/sip-providers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...provider,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Successfully added SIP provider:`, data);
    
    return data;
  } catch (error) {
    console.error(`[CustomBackendService] Error in addSipProvider:`, error);
    throw error;
  }
};

export const updateSipProvider = async (provider: any, userId: string) => {
  console.log(`[CustomBackendService] Updating SIP provider: ${provider.id}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    const response = await fetch(`${API_URL}/sip-providers/${provider.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...provider,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Successfully updated SIP provider:`, data);
    
    return data;
  } catch (error) {
    console.error(`[CustomBackendService] Error in updateSipProvider:`, error);
    throw error;
  }
};

export const deleteSipProvider = async (providerId: string, userId: string) => {
  console.log(`[CustomBackendService] Deleting SIP provider: ${providerId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/sip-providers/${providerId}?userId=${userId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    console.log(`[CustomBackendService] Successfully deleted SIP provider: ${providerId}`);
    return true;
  } catch (error) {
    console.error(`[CustomBackendService] Error in deleteSipProvider:`, error);
    throw error;
  }
};

export const toggleSipProviderStatus = async (providerId: string, status: boolean, userId: string) => {
  console.log(`[CustomBackendService] Toggling SIP provider status: ${providerId} to ${status}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    const response = await fetch(`${API_URL}/sip-providers/${providerId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        active: status,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    console.log(`[CustomBackendService] Successfully toggled SIP provider status: ${providerId}`);
    return true;
  } catch (error) {
    console.error(`[CustomBackendService] Error in toggleSipProviderStatus:`, error);
    throw error;
  }
};

/**
 * Greeting Files management
 */
export const fetchGreetingFiles = async (userId: string) => {
  console.log(`[CustomBackendService] Fetching greeting files for user: ${userId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/greeting-files?userId=${userId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Fetched ${data.length} greeting files successfully`);
    
    return data;
  } catch (error) {
    console.error(`[CustomBackendService] Error in fetchGreetingFiles:`, error);
    throw error;
  }
};

export const uploadGreetingFile = async (audioBlob: Blob, userId: string) => {
  console.log(`[CustomBackendService] Uploading greeting file for user: ${userId}`);
  
  try {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('userId', userId);
    
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/greeting-files`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Successfully uploaded greeting file:`, data);
    
    return { success: true, url: data.url };
  } catch (error) {
    console.error(`[CustomBackendService] Error in uploadGreetingFile:`, error);
    throw error;
  }
};

/**
 * Campaigns management
 */
export const fetchCampaigns = async (userId: string) => {
  console.log(`[CustomBackendService] Fetching campaigns for user: ${userId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/campaigns?userId=${userId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Fetched ${data.length} campaigns successfully`);
    
    return data;
  } catch (error) {
    console.error(`[CustomBackendService] Error in fetchCampaigns:`, error);
    throw error;
  }
};

export const createCampaign = async (campaign: any, userId: string) => {
  console.log(`[CustomBackendService] Creating campaign for user: ${userId}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    const response = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...campaign,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Successfully created campaign:`, data);
    
    return data;
  } catch (error) {
    console.error(`[CustomBackendService] Error in createCampaign:`, error);
    throw error;
  }
};

/**
 * Contact Lists management
 */
export const fetchContactLists = async (userId: string) => {
  console.log(`[CustomBackendService] Fetching contact lists for user: ${userId}`);
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/contact-lists?userId=${userId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[CustomBackendService] Fetched ${data.length} contact lists successfully`);
    
    return data;
  } catch (error) {
    console.error(`[CustomBackendService] Error in fetchContactLists:`, error);
    throw error;
  }
};
