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
        callCount: item.call_count !== null ? Number(item.call_count) : 0
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
 * FIXED: Simplified operation and improved error handling
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
    // Create the data object
    const insertData = {
      user_id: userId,
      name,
      phone_number: number,
      description: description || null,
      call_count: 0
    };
    
    console.log(`[TransferNumberService] Insert data:`, JSON.stringify(insertData));
    
    // Execute a simpler insert query without using .single()
    const { data, error } = await supabase
      .from('transfer_numbers')
      .insert(insertData)
      .select();
    
    if (error) {
      console.error(`[TransferNumberService] Database error when adding transfer number:`, error);
      throw error;
    }
    
    console.log(`[TransferNumberService] Insert response:`, data);
    
    if (data && data.length > 0) {
      const newTransferNumber = data[0];
      console.log(`[TransferNumberService] Successfully created transfer number:`, newTransferNumber);
      
      return {
        id: newTransferNumber.id,
        name: newTransferNumber.name,
        number: newTransferNumber.phone_number,
        description: newTransferNumber.description || "No description provided",
        dateAdded: new Date(newTransferNumber.created_at),
        callCount: newTransferNumber.call_count !== null ? Number(newTransferNumber.call_count) : 0
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
