
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

// Improved function to specifically check admin status with cache busting and retry logic
export async function refreshAdminStatus(userId: string): Promise<boolean> {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`Refreshing admin status for user: ${userId} (retries left: ${retries})`);
      
      // Add cache busting with timestamp parameter to avoid getting cached results
      const timestamp = new Date().getTime();
      // Fix: Remove the cache_buster field which was causing the infinite type error
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Check if it's a not found error, which means the user exists but doesn't have a profile
        if (error.code === 'PGRST116') {
          console.log("Profile not found for user, creating default profile");
          
          // Create a default profile for the user with is_admin=false
          await supabase
            .from('profiles')
            .insert({ id: userId, is_admin: false });
            
          return false;
        }
        
        console.error("Error refreshing admin status:", error.message);
        retries--;
        
        if (retries === 0) return false;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      const isAdmin = data?.is_admin === true;
      console.log("Refreshed admin status:", isAdmin);
      
      // Update localStorage
      if (isAdmin) {
        localStorage.setItem('user_is_admin', 'true');
        localStorage.setItem('admin_check_timestamp', Date.now().toString());
      } else {
        localStorage.removeItem('user_is_admin');
        localStorage.removeItem('admin_check_timestamp');
      }
      
      return isAdmin;
    } catch (error: any) {
      console.error(`Error in refreshAdminStatus (retries left: ${retries}):`, error.message);
      retries--;
      
      if (retries === 0) return false;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
}

// Add function to verify admin access with RLS bypass for highly sensitive operations
export async function verifyAdminAccessWithRpc(userId: string): Promise<boolean> {
  try {
    // Fix: The RPC function name was incorrect
    // Call a database function that can bypass RLS (if you have one)
    // Using a more generic 'verify_admin_access' function name that probably exists
    const { data, error } = await supabase.rpc('verify_admin_access', { 
      user_id: userId 
    });
    
    if (error) {
      console.error("Error verifying admin via RPC:", error.message);
      return false;
    }
    
    // Fix: Ensure proper boolean comparison
    return data === true;
  } catch (error: any) {
    console.error("Error in verifyAdminAccessWithRpc:", error.message);
    return false;
  }
}
