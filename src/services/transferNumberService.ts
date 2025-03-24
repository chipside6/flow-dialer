
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[TransferNumberService] No authenticated user found');
      throw new Error('Authentication required to fetch transfer numbers');
    }
    
    console.log(`[TransferNumberService] Executing supabase query`);
    
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('transfer_numbers')
      .select('id, name, phone_number, description, created_at, call_count')
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
