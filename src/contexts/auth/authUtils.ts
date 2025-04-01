
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("Fetching user profile for:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
    
    // Create a UserProfile object with all required fields
    const profile: UserProfile = {
      id: data.id,
      email: '', // This will be set by the AuthProvider
      full_name: data.full_name || '',
      avatar_url: data.avatar_url || null,
      company_name: data.company_name || '',
      is_admin: !!data.is_admin // Ensure this is a boolean
    };
    
    return profile;
  } catch (error: any) {
    console.error("Error in fetchUserProfile:", error.message);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
  try {
    console.log("Updating user profile:", userId, data);
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
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
