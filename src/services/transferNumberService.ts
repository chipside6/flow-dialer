
import { supabase } from "@/integrations/supabase/client";
import { TransferNumber } from "@/types/transferNumber";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetches all transfer numbers for a specific user from the database
 */
export const fetchUserTransferNumbers = async (userId: string): Promise<TransferNumber[]> => {
  console.log(`[TransferNumberService] Fetching transfer numbers for user: ${userId}`);
  
  if (!userId) {
    console.error('[TransferNumberService] No user ID provided');
    throw new Error('User ID is required to fetch transfer numbers');
  }
  
  try {
    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('[TransferNumberService] No active session');
      throw new Error('Authentication required to fetch transfer numbers');
    }
    
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
  
  if (!userId) {
    console.error('[TransferNumberService] No user ID provided');
    throw new Error('User ID is required to add transfer numbers');
  }
  
  try {
    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('[TransferNumberService] No active session');
      throw new Error('Authentication required to add transfer numbers');
    }
    
    // Create the data object
    const insertData = {
      user_id: userId,
      name,
      phone_number: number,
      description: description || null,
      call_count: 0
    };
    
    console.log(`[TransferNumberService] Insert data:`, JSON.stringify(insertData));
    
    // Perform the insert operation
    const { data, error } = await supabase
      .from('transfer_numbers')
      .insert(insertData)
      .select('*')
      .single();
    
    if (error) {
      console.error(`[TransferNumberService] Database error when inserting transfer number:`, error);
      throw error;
    }
    
    if (data) {
      console.log(`[TransferNumberService] Insert successful, returned data:`, data);
      
      return {
        id: data.id,
        name: data.name,
        number: data.phone_number,
        description: data.description || "No description provided",
        dateAdded: new Date(data.created_at),
        callCount: data.call_count !== null ? Number(data.call_count) : 0
      };
    }
    
    console.log(`[TransferNumberService] Insert successful but no data returned`);
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
  
  if (!userId || !transferNumberId) {
    console.error('[TransferNumberService] Missing user ID or transfer number ID');
    throw new Error('User ID and transfer number ID are required for deletion');
  }
  
  try {
    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('[TransferNumberService] No active session');
      throw new Error('Authentication required to delete transfer numbers');
    }
    
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
