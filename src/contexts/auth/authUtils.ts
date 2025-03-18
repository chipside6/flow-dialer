
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Profile } from './types';

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as Profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    
    return true;
  } catch (error: any) {
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
    const { error } = await supabase
      .from('profiles')
      .update({ is_affiliate: true })
      .eq('id', userId);
    
    if (error) throw error;
    
    toast({
      title: "Affiliate status updated",
      description: "User has been set as an affiliate.",
    });
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error updating affiliate status",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
};
