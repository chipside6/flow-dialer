
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export const fetchUserProfile = async (userId: string) => {
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
    
    console.log("Profile retrieved successfully");
    
    // Create a properly typed UserProfile object
    const userProfile: UserProfile = {
      id: data.id,
      email: data.email || '',
      full_name: data.full_name || '',
      avatar_url: data.avatar_url || null,
      company_name: data.company_name || '',
      is_admin: !!data.is_admin,
      is_affiliate: !!data.is_affiliate
    };
    
    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

export const setUserAsAffiliate = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_affiliate: true })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error setting affiliate status:', error);
    return false;
  }
};
