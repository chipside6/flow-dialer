
import { supabase } from "@/integrations/supabase/client";
import { TransferNumber } from "@/hooks/useTransferNumbers";

/**
 * Fetches all transfer numbers for a specific user from the database
 */
export const fetchUserTransferNumbers = async (userId: string): Promise<TransferNumber[]> => {
  console.log("Fetching transfer numbers for user:", userId);
  
  try {
    const { data, error } = await supabase
      .from('transfer_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Database error when fetching transfer numbers:", error);
      throw error;
    }
    
    if (data) {
      console.log("Fetched transfer numbers successfully, count:", data.length);
      return data.map(item => ({
        id: item.id,
        name: item.name,
        number: item.phone_number,
        description: item.description || "No description provided",
        dateAdded: new Date(item.created_at),
        callCount: 0 // This would come from a different table in a real implementation
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchUserTransferNumbers:", error);
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
  console.log("Adding transfer number for user:", userId);
  
  try {
    // Insert the transfer number into the database
    const { data, error } = await supabase
      .from('transfer_numbers')
      .insert({
        user_id: userId,
        name: name,
        phone_number: number,
        description: description || null
      })
      .select();
    
    if (error) {
      console.error("Database error when adding transfer number:", error);
      throw error;
    }
    
    console.log("Database response after adding transfer number:", data);
    
    if (data && data.length > 0) {
      const newItem = data[0];
      return {
        id: newItem.id,
        name: newItem.name,
        number: newItem.phone_number,
        description: newItem.description || "No description provided",
        dateAdded: new Date(newItem.created_at),
        callCount: 0
      };
    }
    
    console.warn("No data returned after adding transfer number");
    return null;
  } catch (error) {
    console.error("Error in addTransferNumberToDatabase:", error);
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
  try {
    const { error } = await supabase
      .from('transfer_numbers')
      .delete()
      .eq('id', transferNumberId)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Database error when deleting transfer number:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteTransferNumberFromDatabase:", error);
    throw error;
  }
};
