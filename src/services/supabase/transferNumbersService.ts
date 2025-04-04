
import { supabase } from '@/integrations/supabase/client';
import { TransferNumber } from '@/types/transferNumber';
import { toast } from '@/components/ui/use-toast';

/**
 * Fetches all transfer numbers for a specific user with optimized performance
 */
export const fetchUserTransferNumbers = async (userId: string): Promise<TransferNumber[]> => {
  console.log(`[TransferNumbersService] Fetching transfer numbers for user: ${userId}`);
  
  if (!userId) {
    console.error('[TransferNumbersService] No user ID provided');
    throw new Error('User ID is required to fetch transfer numbers');
  }
  
  try {
    // Check if we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[TransferNumbersService] Session error:', sessionError);
      throw new Error('Authentication error: ' + sessionError.message);
    }
    
    if (!sessionData.session) {
      console.error('[TransferNumbersService] No active session');
      throw new Error('Authentication required to fetch transfer numbers');
    }
    
    console.log(`[TransferNumbersService] Executing supabase query for user ${userId}`);
    
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('transfer_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const queryTime = Date.now() - startTime;
    console.log(`[TransferNumbersService] Query completed in ${queryTime}ms`);
    
    if (error) {
      console.error(`[TransferNumbersService] Database error when fetching transfer numbers:`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      console.log(`[TransferNumbersService] No data returned from query`);
      return [];
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
  } catch (error: any) {
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
): Promise<TransferNumber> => {
  console.log(`[TransferNumbersService] Adding transfer number for user: ${userId}`, {
    name,
    number,
    description: description ? "provided" : "empty"
  });
  
  try {
    // Verify we have a valid session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!sessionData.session) {
      console.error('[TransferNumbersService] No active session');
      throw new Error('Authentication required to add transfer numbers');
    }
    
    // Make sure phone number formatting is correct
    const formattedNumber = number.trim();
    
    // Insert the new transfer number
    const { data, error } = await supabase
      .from('transfer_numbers')
      .insert({
        user_id: userId,
        name: name.trim(),
        phone_number: formattedNumber,
        description: description ? description.trim() : null,
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
      name: data.name,
      number: data.phone_number,
      description: data.description || "No description provided",
      dateAdded: new Date(data.created_at),
      callCount: 0
    };
  } catch (error: any) {
    console.error(`[TransferNumbersService] Error in addTransferNumber:`, error);
    
    // Provide a user-friendly error message
    const errorMessage = error.message || "There was an error adding your transfer number.";
    toast({
      title: "Error adding transfer number",
      description: errorMessage,
      variant: "destructive"
    });
    
    throw error;
  }
};

/**
 * Deletes a transfer number
 */
export const deleteTransferNumber = async (
  userId: string, 
  transferNumberId: string
): Promise<boolean> => {
  console.log(`[TransferNumbersService] Deleting transfer number ${transferNumberId} for user ${userId}`);
  
  try {
    // Verify we have a valid session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!sessionData.session) {
      console.error('[TransferNumbersService] No active session');
      throw new Error('Authentication required to delete transfer numbers');
    }
    
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
  } catch (error: any) {
    console.error(`[TransferNumbersService] Error in deleteTransferNumber:`, error);
    
    toast({
      title: "Error deleting transfer number",
      description: error.message || "There was an error deleting your transfer number.",
      variant: "destructive"
    });
    
    throw error;
  }
};
