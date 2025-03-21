
import { supabase } from "@/integrations/supabase/client";
import { TransferNumber } from "@/types/transferNumber";

/**
 * Fetches all transfer numbers for a specific user from the database
 */
export const fetchUserTransferNumbers = async (userId: string): Promise<TransferNumber[]> => {
  console.log(`[TransferNumberService] Fetching transfer numbers for user: ${userId}`);
  
  try {
    console.log(`[TransferNumberService] Executing supabase query`);
    
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('transfer_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const queryTime = Date.now() - startTime;
    console.log(`[TransferNumberService] Query completed in ${queryTime}ms`);
    
    if (error) {
      console.error(`[TransferNumberService] Database error when fetching transfer numbers:`, error);
      throw error;
    }
    
    if (data) {
      console.log(`[TransferNumberService] Fetched ${data.length} transfer numbers successfully`);
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        number: item.phone_number,
        description: item.description || "No description provided",
        dateAdded: new Date(item.created_at),
        callCount: 0 // Set a default value since this property doesn't exist in the database
      }));
    }
    
    console.log(`[TransferNumberService] No data returned from query`);
    return [];
  } catch (error) {
    console.error(`[TransferNumberService] Error in fetchUserTransferNumbers:`, error);
    throw error;
  }
};

/**
 * Adds a new transfer number to the database
 */
export const addTransferNumberToDatabase = async (
  userId: string, 
  name: string, 
  number: string, 
  description: string
): Promise<TransferNumber | null> => {
  console.log(`[TransferNumberService] Adding transfer number for user: ${userId}`, {
    name,
    number,
    description: description ? "provided" : "empty"
  });
  
  try {
    // Insert the transfer number into the database
    console.log(`[TransferNumberService] Executing insert query`);
    
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('transfer_numbers')
      .insert({
        user_id: userId,
        name: name,
        phone_number: number,
        description: description || null
      })
      .select();
    
    const queryTime = Date.now() - startTime;
    console.log(`[TransferNumberService] Insert query completed in ${queryTime}ms`);
    
    if (error) {
      console.error(`[TransferNumberService] Database error when adding transfer number:`, error);
      throw error;
    }
    
    console.log(`[TransferNumberService] Database response after adding transfer number:`, data);
    
    if (data && data.length > 0) {
      const newItem = data[0];
      return {
        id: newItem.id,
        name: newItem.name,
        number: newItem.phone_number,
        description: newItem.description || "No description provided",
        dateAdded: new Date(newItem.created_at),
        callCount: 0 // Set a default value since this property doesn't exist in the database
      };
    }
    
    console.warn(`[TransferNumberService] No data returned after adding transfer number`);
    return null;
  } catch (error) {
    console.error(`[TransferNumberService] Error in addTransferNumberToDatabase:`, error);
    throw error;
  }
};

/**
 * Deletes a transfer number from the database
 */
export const deleteTransferNumberFromDatabase = async (
  userId: string, 
  transferNumberId: string
): Promise<boolean> => {
  console.log(`[TransferNumberService] Deleting transfer number ${transferNumberId} for user ${userId}`);
  
  try {
    console.log(`[TransferNumberService] Executing delete query`);
    
    const startTime = Date.now();
    const { error } = await supabase
      .from('transfer_numbers')
      .delete()
      .eq('id', transferNumberId)
      .eq('user_id', userId);
    
    const queryTime = Date.now() - startTime;
    console.log(`[TransferNumberService] Delete query completed in ${queryTime}ms`);
    
    if (error) {
      console.error(`[TransferNumberService] Database error when deleting transfer number:`, error);
      throw error;
    }
    
    console.log(`[TransferNumberService] Successfully deleted transfer number ${transferNumberId}`);
    return true;
  } catch (error) {
    console.error(`[TransferNumberService] Error in deleteTransferNumberFromDatabase:`, error);
    throw error;
  }
};
