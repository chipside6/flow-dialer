
import { supabase } from '@/integrations/supabase/client';
import { storeAdminStatus } from '@/services/auth/session';

export const refreshAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // First check if the session is valid
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return false;
    
    // Fetch the current admin status from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    // Store the admin status for persistence
    const isUserAdmin = !!data?.is_admin;
    storeAdminStatus(isUserAdmin);
    
    return isUserAdmin;
  } catch (error) {
    console.error('Error refreshing admin status:', error);
    return false;
  }
};

// Enhanced function to check if a user has an active subscription
export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    console.log(`Checking subscription status for user: ${userId}`);
    
    // Verify if the session is still valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Session invalid when checking subscription status');
      return false;
    }
    
    // First try the subscriptions table
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (subscriptionError) {
      console.error('Error checking subscription status:', subscriptionError);
      // Continue with fallback check instead of returning early
    } else if (subscriptionData) {
      // Check if it's a lifetime plan which never expires
      if (subscriptionData.plan_id === 'lifetime') {
        console.log('User has lifetime subscription');
        return true;
      }
      
      // Check if it's a trial plan that hasn't expired
      if (subscriptionData.plan_id === 'trial' && subscriptionData.current_period_end) {
        const now = new Date();
        const endDate = new Date(subscriptionData.current_period_end);
        
        if (now < endDate) {
          console.log('User has active trial subscription');
          return true;
        } else {
          console.log('User has expired trial subscription');
        }
      }
      
      // For other active subscription types
      if (subscriptionData.status === 'active') {
        console.log('User has active subscription');
        return true;
      }
    }
    
    // Fallback: check payments table to see if user has made a lifetime purchase
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', 'lifetime')
      .eq('status', 'completed')
      .maybeSingle();
      
    if (paymentError) {
      console.error('Error checking payment status:', paymentError);
    } else if (paymentData) {
      console.log('User has lifetime payment record');
      
      // If there's a payment but no subscription record, create the subscription
      if (!subscriptionData) {
        try {
          await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan_id: 'lifetime',
              plan_name: 'Lifetime Access',
              status: 'active'
            });
            
          console.log('Created missing lifetime subscription record for user with payment');
        } catch (createError) {
          console.error('Error creating subscription record:', createError);
        }
      }
      
      return true;
    }

    console.log('No active subscription found for user');
    return false;
  } catch (error) {
    console.error('Error in checkSubscriptionStatus:', error);
    return false;
  }
};
