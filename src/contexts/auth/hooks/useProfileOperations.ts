
import { UserProfile } from '../types';
import { updateUserProfileAction } from '../authActions';
import { toast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

export function useProfileOperations(
  user: User | null, 
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
) {
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return { error: new Error('No user authenticated') };
    }
    
    try {
      const result = await updateUserProfileAction(user.id, data);
      
      if (!result.error) {
        // Update local profile state
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data
        } as UserProfile));
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    updateProfile
  };
}
