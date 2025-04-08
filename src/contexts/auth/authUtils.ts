
import { supabase } from '@/integrations/supabase/client';

export const refreshAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Fetch the current admin status from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data?.is_admin;
  } catch (error) {
    console.error('Error refreshing admin status:', error);
    return false;
  }
};

// Simple function to check if a user has an active subscription
export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Check for an active subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
