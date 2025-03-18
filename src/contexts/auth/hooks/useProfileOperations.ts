
import { UserProfile } from '../types';
import { updateUserProfileAction, setAsAffiliateAction } from '../authActions';
import { toast } from '@/components/ui/use-toast';

export function useProfileOperations(
  user: { id: string } | null, 
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  setIsAffiliate: React.Dispatch<React.SetStateAction<boolean>>
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
  
  const setAsAffiliate = async (userId: string) => {
    try {
      const { success, error } = await setAsAffiliateAction(userId);
      
      if (error) {
        toast({
          title: "Affiliate status update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // If updating the current user, update the state
      if (success && user && user.id === userId) {
        setIsAffiliate(true);
        setProfile(prevProfile => ({
          ...prevProfile,
          is_affiliate: true
        } as UserProfile));
        
        toast({
          title: "Affiliate status updated",
          description: "You are now an affiliate",
        });
      }
    } catch (error: any) {
      toast({
        title: "Affiliate status update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    updateProfile,
    setAsAffiliate
  };
}
