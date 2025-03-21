
// A custom backend service for transfer numbers
// Replace the API_URL with your actual backend URL
const API_URL = 'http://localhost:3001/api';

/**
 * Fetches all transfer numbers for a specific user from the custom backend
 */
export const fetchUserTransferNumbers = async (userId: string) => {
  console.log(`[CustomBackendService] Fetching transfer numbers for user: ${userId}`);
  
  try {
    const response = await fetch(`${API_URL}/transfer-numbers?userId=${userId}`);
    
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
    const response = await fetch(`${API_URL}/transfer-numbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/transfer-numbers/${transferNumberId}?userId=${userId}`, {
      method: 'DELETE',
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
