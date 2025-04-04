
import { supabase } from '@/integrations/supabase/client';
import { pricingPlans } from '@/data/pricingPlans';
import { createLifetimeSubscription } from '@/hooks/subscription/subscriptionApi';

export async function activateTrialPlan(userId: string) {
  console.log("Checking if user needs trial activation:", userId);
  
  try {
    // Check if user already has any subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error checking subscriptions:", error);
      return;
    }
    
    // If no subscription exists, activate trial plan
    if (!data || data.length === 0) {
      console.log("No subscription found, activating trial plan");
      
      const trialPlan = pricingPlans.find(plan => plan.isTrial);
      
      if (trialPlan) {
        // Calculate trial end date (3 days from now)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);
        
        // Create trial subscription
        await createLifetimeSubscription(userId, {
          ...trialPlan,
          trialEndDate: trialEndDate.toISOString()
        });
        
        console.log("Trial plan activated successfully");
      }
    }
  } catch (err) {
    console.error("Error activating trial plan:", err);
  }
}
