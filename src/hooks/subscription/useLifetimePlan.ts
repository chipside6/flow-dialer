
import { useState } from 'react';
import { createLifetimeSubscription, getPlanById } from './subscriptionApi';
import { toast } from '@/components/ui/use-toast';

export const useLifetimePlan = (userId: string | undefined, refreshSubscription: () => Promise<any>) => {
  const [isActivating, setIsActivating] = useState(false);
  
  const activateLifetimePlan = async (planId = 'lifetime'): Promise<{ success: boolean; error?: Error }> => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to activate a subscription plan",
        variant: "destructive",
      });
      return { success: false, error: new Error('User not authenticated') };
    }
    
    setIsActivating(true);
    
    try {
      const plan = getPlanById(planId);
      
      if (!plan) {
        toast({
          title: "Plan error",
          description: `The plan "${planId}" could not be found`,
          variant: "destructive",
        });
        return { success: false, error: new Error(`Plan "${planId}" not found`) };
      }
      
      const success = await createLifetimeSubscription(userId, plan);
      
      if (success) {
        toast({
          title: "Success!",
          description: "Your lifetime plan has been activated. Enjoy unlimited access!",
        });
        
        // Refresh subscription data in parent component
        await refreshSubscription();
        
        return { success: true };
      } else {
        toast({
          title: "Activation failed",
          description: "Could not activate the lifetime plan. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: new Error('Subscription activation failed') };
      }
    } catch (error) {
      console.error("Error activating lifetime plan:", error);
      
      toast({
        title: "Activation error",
        description: "An error occurred while activating your plan",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    } finally {
      setIsActivating(false);
    }
  };
  
  return {
    activateLifetimePlan,
    isActivating
  };
};
