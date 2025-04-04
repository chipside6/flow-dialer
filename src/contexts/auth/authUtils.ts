
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("Fetching user profile for:", userId);
    
    // Directly query profiles table with a more robust query
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, is_admin, created_at, updated_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
    
    if (!data) {
      console.log("No profile found for user:", userId);
      return null;
    }
    
    console.log("Profile data from DB:", data);
    
    // Get user's email directly from auth.session to avoid admin API call
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';
    
    // Create a UserProfile object with required fields, ensuring is_admin is a boolean
    const profile: UserProfile = {
      id: data.id,
      email: userEmail,
      full_name: data.full_name || '',
      is_admin: data.is_admin === true, // Force to boolean
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    console.log("Constructed profile object:", profile);
    return profile;
  } catch (error: any) {
    console.error("Error in fetchUserProfile:", error.message);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
  try {
    console.log("Updating user profile:", userId, data);
    
    // We don't update email in profiles since it's not stored there
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        is_admin: data.is_admin === true // Force to boolean
      })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating profile:", error.message);
      return false;
    }
    
    console.log("Profile updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error in updateUserProfile:", error.message);
    return false;
  }
}

// New function to specifically check admin status with cache busting
export async function refreshAdminStatus(userId: string): Promise<boolean> {
  try {
    console.log("Refreshing admin status for user:", userId);
    
    // Add a cache-busting query parameter to force a fresh DB read
    const timestamp = new Date().getTime();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
      .options({ head: false, count: 'exact' })
      // Add timestamp to force cache invalidation
      .filter('updated_at', 'gte', '2000-01-01');
    
    if (error) {
      console.error("Error refreshing admin status:", error.message);
      return false;
    }
    
    const isAdmin = data?.is_admin === true;
    console.log("Refreshed admin status:", isAdmin);
    return isAdmin;
  } catch (error: any) {
    console.error("Error in refreshAdminStatus:", error.message);
    return false;
  }
}
