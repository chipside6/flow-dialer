
import { createLifetimeSubscription } from '@/services/subscriptionService';
import { toast } from '@/components/ui/use-toast';
import { getPlanById } from '@/services/subscriptionService';

// Calculate a trial end date 3 days from now
const calculateTrialEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString();
};

// Activate a trial plan for a new user
export const activateTrialPlan = async (userId: string): Promise<boolean> => {
  try {
    console.log("Activating trial plan for new user:", userId);
    
    // Get the trial plan from the pricing plans
    const trialPlan = getPlanById('trial');
    
    if (!trialPlan) {
      console.error("Trial plan not found");
      return false;
    }
    
    // Add the trial end date to the plan
    const planWithEndDate = {
      ...trialPlan,
      trialEndDate: calculateTrialEndDate()
    };
    
    // Create a trial subscription
    const success = await createLifetimeSubscription(userId, planWithEndDate);
    
    if (success) {
      console.log("Trial plan activated successfully");
      localStorage.setItem('userSubscriptionPlan', 'trial');
      
      toast({
        title: "Welcome!",
        description: "Your 3-day trial has been activated. Enjoy full access to all features!",
      });
      
      return true;
    } else {
      console.error("Failed to activate trial plan");
      return false;
    }
  } catch (error) {
    console.error("Error activating trial plan:", error);
    return false;
  }
};
