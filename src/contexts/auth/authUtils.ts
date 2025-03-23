
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
    
    // Create a properly typed UserProfile object with what we have from the profile data
    // Only include properties that we know exist in the data
    const userProfile: UserProfile = {
      id: data.id,
      email: '', // Initialize with empty string, we'll try to get this below
      full_name: data.full_name || '',
      avatar_url: data.avatar_url || '',
      company_name: data.company_name || '',
      is_admin: !!data.is_admin,
      is_affiliate: !!data.is_affiliate
    };

    // If we don't have an email in the profile data, try to get it from auth.users
    console.log("authUtils - Getting email from auth user");
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      userProfile.email = userData.user.email || '';
      console.log("authUtils - Got email from auth user:", userProfile.email);
    }
    
    // Validate that we have an email
    if (!userProfile.email) {
      console.error("authUtils - Could not retrieve email for user profile");
      return null;
    }
    
    return userProfile;
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
