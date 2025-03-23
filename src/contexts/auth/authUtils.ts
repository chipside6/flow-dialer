
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from '@/services/auth/types';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log("authUtils - Fetching user profile for:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("authUtils - Error fetching profile:", error.message);
      return null;
    }
    
    console.log("authUtils - Profile retrieved successfully:", data);
    
    // Ensure the data has the required 'email' field
    if (!data.email) {
      console.error("authUtils - Profile data missing required email field");
      // Try to fetch the email from the users table if it's not in the profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (userError || !userData) {
        console.error("authUtils - Could not find email for user:", userError?.message);
        return null;
      }
      
      // Combine the profile data with the email from the users table
      const profileWithEmail = {
        ...data,
        email: userData.email
      };
      
      return profileWithEmail as UserProfile;
    }
    
    // If email is already present, return the data as is
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    console.log("authUtils - Updating profile for user:", userId);
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log("authUtils - Profile updated successfully");
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    
    return true;
  } catch (error: any) {
    console.error("authUtils - Error updating profile:", error.message);
    toast({
      title: "Error updating profile",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
};

export const setUserAsAffiliate = async (userId: string) => {
  try {
    console.log("authUtils - Setting user as affiliate:", userId);
    const { error } = await supabase
      .from('profiles')
      .update({ is_affiliate: true })
      .eq('id', userId);
    
    if (error) throw error;
    
    console.log("authUtils - User set as affiliate successfully");
    toast({
      title: "Affiliate status updated",
      description: "User has been set as an affiliate.",
    });
    
    return true;
  } catch (error: any) {
    console.error("authUtils - Error setting affiliate status:", error.message);
    toast({
      title: "Error updating affiliate status",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
};
