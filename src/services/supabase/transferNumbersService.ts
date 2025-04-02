
import { supabase } from '@/integrations/supabase/client';
import { TransferNumber } from '@/types/transferNumber';
import { toast } from '@/components/ui/use-toast';

/**
 * Fetches all transfer numbers for a specific user with optimized performance
 */
export const fetchUserTransferNumbers = async (userId: string): Promise<TransferNumber[]> => {
  console.log(`[TransferNumbersService] Fetching transfer numbers for user: ${userId}`);
  
  try {
    // Set a reasonable timeout for the query
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout (reduced from 5s)
    
    // Fetch transfer numbers for this user
    const { data, error } = await supabase
      .from('transfer_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal);
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (error) {
      console.error(`[TransferNumbersService] Error in fetchUserTransferNumbers:`, error);
      throw error;
    }
    
    console.log(`[TransferNumbersService] Fetched ${data?.length || 0} transfer numbers successfully`);
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      number: item.phone_number,
      description: item.description || "No description provided",
      dateAdded: new Date(item.created_at),
      callCount: item.call_count !== null ? Number(item.call_count) : 0
    }));
  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'AbortError') {
      console.error("[TransferNumbersService] Timeout error fetching transfer numbers");
      throw new Error("Request timed out when fetching transfer numbers. Please try again.");
    }
    
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
    
    toast({
      title: "Transfer number added",
      description: `"${name}" has been added successfully.`
    });
    
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
    toast({
      title: "Error adding transfer number",
      description: error.message || "There was an error adding your transfer number.",
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
    
    toast({
      title: "Transfer number deleted",
      description: "The transfer number has been deleted successfully."
    });
    
    return true;
  } catch (error) {
    console.error(`[TransferNumbersService] Error in deleteTransferNumber:`, error);
    toast({
      title: "Error deleting transfer number",
      description: error.message || "There was an error deleting your transfer number.",
      variant: "destructive"
    });
    throw error;
  }
};
