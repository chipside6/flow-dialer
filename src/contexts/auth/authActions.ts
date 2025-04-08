
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const updateUserProfileAction = async (userId: string, data: any) => {
  try {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: updatedProfile, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
};
