
import { supabase } from '@/integrations/supabase/client';

export const refreshAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Clear any cached admin status first
    localStorage.removeItem('user_is_admin');
    localStorage.removeItem('admin_check_timestamp');
    
    // Fetch the current admin status from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    const isAdmin = !!data?.is_admin;
    
    // Cache the result with timestamp
    localStorage.setItem('user_is_admin', isAdmin ? 'true' : 'false');
    localStorage.setItem('admin_check_timestamp', Date.now().toString());
    
    return isAdmin;
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

// Helper function to get cached admin status with expiry check
export const getCachedAdminStatus = (userId: string): boolean | null => {
  try {
    const cachedStatus = localStorage.getItem('user_is_admin');
    const timestamp = localStorage.getItem('admin_check_timestamp');
    
    if (!cachedStatus || !timestamp) return null;
    
    // Check if the cache is expired (30 minutes)
    const cacheTime = parseInt(timestamp, 10);
    const now = Date.now();
    const cacheAge = now - cacheTime;
    const maxCacheAge = 30 * 60 * 1000; // 30 minutes
    
    if (cacheAge > maxCacheAge) return null;
    
    return cachedStatus === 'true';
  } catch (e) {
    return null;
  }
};
