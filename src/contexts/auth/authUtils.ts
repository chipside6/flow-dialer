
import { supabase } from '@/integrations/supabase/client';

export const refreshAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Fetch the current admin status from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return !!data?.is_admin;
  } catch (error) {
    console.error('Error refreshing admin status:', error);
    return false;
  }
};
