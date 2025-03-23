
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all transfer numbers for a specific user
 */
export const fetchUserTransferNumbers = async (userId: string) => {
  console.log(`[TransferNumbersService] Fetching transfer numbers for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('transfer_numbers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[TransferNumbersService] Error in fetchUserTransferNumbers:`, error);
      throw error;
    }
    
    console.log(`[TransferNumbersService] Fetched ${data.length} transfer numbers successfully`);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      number: item.phone_number,
      description: item.description || "No description provided",
      dateAdded: new Date(item.created_at),
      callCount: item.call_count !== null ? Number(item.call_count) : 0
    }));
  } catch (error) {
    console.error(`[TransferNumbersService] Error in fetchUserTransferNumbers:`, error);
    throw error;
  }
};

/**
 * Adds a new transfer number
 */
export const addTransferNumber = async (
  userId: string, 
  name: string, 
  number: string, 
  description: string
) => {
  console.log(`[TransferNumbersService] Adding transfer number for user: ${userId}`, {
    name,
    number,
    description: description ? "provided" : "empty"
  });
  
  try {
    const { data, error } = await supabase
      .from('transfer_numbers')
      .insert({
        user_id: userId,
        name,
        phone_number: number,
        description: description || null,
        call_count: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[TransferNumbersService] Error in addTransferNumber:`, error);
      throw error;
    }
    
    console.log(`[TransferNumbersService] Insert successful:`, data);
    
    return {
      id: data.id,
      name,
      number,
      description: description || "No description provided",
      dateAdded: new Date(),
      callCount: 0
    };
  } catch (error) {
    console.error(`[TransferNumbersService] Error in addTransferNumber:`, error);
    throw error;
  }
};

/**
 * Deletes a transfer number
 */
export const deleteTransferNumber = async (
  userId: string, 
  transferNumberId: string
) => {
  console.log(`[TransferNumbersService] Deleting transfer number ${transferNumberId} for user ${userId}`);
  
  try {
    const { error } = await supabase
      .from('transfer_numbers')
      .delete()
      .eq('id', transferNumberId)
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[TransferNumbersService] Error in deleteTransferNumber:`, error);
      throw error;
    }
    
    console.log(`[TransferNumbersService] Successfully deleted transfer number ${transferNumberId}`);
    return true;
  } catch (error) {
    console.error(`[TransferNumbersService] Error in deleteTransferNumber:`, error);
    throw error;
  }
};
