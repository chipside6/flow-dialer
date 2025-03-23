
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all contact lists for a specific user
 */
export const fetchContactLists = async (userId: string) => {
  console.log(`[ContactListsService] Fetching contact lists for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('contact_lists')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[ContactListsService] Error in fetchContactLists:`, error);
      throw error;
    }
    
    console.log(`[ContactListsService] Fetched ${data.length} contact lists successfully`);
    
    return data;
  } catch (error) {
    console.error(`[ContactListsService] Error in fetchContactLists:`, error);
    throw error;
  }
};

/**
 * Creates a new contact list
 */
export const createContactList = async (contactList: any, userId: string) => {
  console.log(`[ContactListsService] Creating contact list for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('contact_lists')
      .insert({
        user_id: userId,
        name: contactList.name,
        description: contactList.description || null
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[ContactListsService] Error in createContactList:`, error);
      throw error;
    }
    
    console.log(`[ContactListsService] Successfully created contact list:`, data);
    
    return data;
  } catch (error) {
    console.error(`[ContactListsService] Error in createContactList:`, error);
    throw error;
  }
};

/**
 * Deletes a contact list
 */
export const deleteContactList = async (contactListId: string, userId: string) => {
  console.log(`[ContactListsService] Deleting contact list ${contactListId} for user ${userId}`);
  
  try {
    const { error } = await supabase
      .from('contact_lists')
      .delete()
      .eq('id', contactListId)
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[ContactListsService] Error in deleteContactList:`, error);
      throw error;
    }
    
    console.log(`[ContactListsService] Successfully deleted contact list ${contactListId}`);
    return true;
  } catch (error) {
    console.error(`[ContactListsService] Error in deleteContactList:`, error);
    throw error;
  }
};
