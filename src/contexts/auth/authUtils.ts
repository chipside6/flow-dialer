
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("Fetching user profile for:", userId);
    
    // First get the profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('id, is_admin')
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
    
    // Now get the user's email from auth.users using admin API
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error("Error fetching user email:", userError.message);
    }
    
    const userEmail = userData?.user?.email || '';
    
    // Create a UserProfile object with required fields, ensuring is_admin is a boolean
    const profile: UserProfile = {
      id: data.id,
      email: userEmail,
      is_admin: data.is_admin === true // Force to boolean
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
