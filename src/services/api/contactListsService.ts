
import { apiFetch } from './apiConfig';

/**
 * Fetches all contact lists for a specific user
 */
export const fetchContactLists = async (userId: string) => {
  console.log(`[ContactListsService] Fetching contact lists for user: ${userId}`);
  
  try {
    const data = await apiFetch(`contact-lists?userId=${userId}`);
    console.log(`[ContactListsService] Fetched ${data.length} contact lists successfully`);
    
    return data;
  } catch (error) {
    console.error(`[ContactListsService] Error in fetchContactLists:`, error);
    throw error;
  }
};
