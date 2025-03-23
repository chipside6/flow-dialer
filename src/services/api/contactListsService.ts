import { apiFetch } from './apiConfig';

/**
 * Fetches all contact lists for a specific user
 */
export const fetchContactLists = async (userId: string) => {
  console.log(`[ContactListsService] Fetching contact lists for user: ${userId}`);
  
  try {
    const data = await apiFetch<any[]>(`contact-lists?userId=${userId}`);
    console.log(`[ContactListsService] Fetched ${data.length} contact lists successfully`);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      contactCount: item.contact_count || item.contactCount || 0,
      dateCreated: new Date(item.created_at || item.dateCreated),
      dateUpdated: new Date(item.updated_at || item.dateUpdated)
    }));
  } catch (error) {
    console.error(`[ContactListsService] Error in fetchContactLists:`, error);
    throw error;
  }
};

/**
 * Adds a new contact list
 */
export const addContactList = async (userId: string, name: string, description: string) => {
  console.log(`[ContactListsService] Adding contact list for user: ${userId}`);
  
  try {
    const data = await apiFetch<any>('contact-lists', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        name,
        description: description || null
      })
    });
    
    console.log(`[ContactListsService] Insert successful:`, data);
    
    return {
      id: data.id,
      name,
      description: description || "",
      contactCount: 0,
      dateCreated: new Date(),
      dateUpdated: new Date()
    };
  } catch (error) {
    console.error(`[ContactListsService] Error in addContactList:`, error);
    throw error;
  }
};

/**
 * Updates an existing contact list
 */
export const updateContactList = async (id: string, name: string, description: string) => {
  console.log(`[ContactListsService] Updating contact list: ${id}`);
  
  try {
    const data = await apiFetch<any>(`contact-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        description: description || null
      })
    });
    
    console.log(`[ContactListsService] Update successful:`, data);
    
    return {
      id: data.id,
      name,
      description: description || "",
      contactCount: data.contact_count || 0,
      dateCreated: new Date(data.created_at),
      dateUpdated: new Date()
    };
  } catch (error) {
    console.error(`[ContactListsService] Error in updateContactList:`, error);
    throw error;
  }
};

/**
 * Deletes a contact list
 */
export const deleteContactList = async (id: string, userId: string) => {
  console.log(`[ContactListsService] Deleting contact list: ${id}`);
  
  try {
    await apiFetch<any>(`contact-lists/${id}?userId=${userId}`, {
      method: 'DELETE'
    });
    
    console.log(`[ContactListsService] Successfully deleted contact list ${id}`);
    return true;
  } catch (error) {
    console.error(`[ContactListsService] Error in deleteContactList:`, error);
    throw error;
  }
};
