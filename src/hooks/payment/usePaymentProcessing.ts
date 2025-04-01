
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { useSubscription } from '@/hooks/subscription';
import { supabase } from '@/integrations/supabase/client';
import { PricingPlan } from '@/data/pricingPlans';

export const usePaymentProcessing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { activateLifetimePlan, fetchCurrentSubscription } = useSubscription();

  const handlePaymentSuccess = async (paymentDetails: any, lifetimePlan: PricingPlan | undefined) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      if (!lifetimePlan) {
        toast({
          title: "Plan not found",
          description: "The lifetime plan does not exist",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      console.log("Recording payment in database for user:", user.id);
      
      // Record the payment in the database with retries
      let paymentRecorded = false;
      let retryAttempt = 0;
      const MAX_RETRIES = 3;
      
      while (!paymentRecorded && retryAttempt < MAX_RETRIES) {
        try {
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .insert([{
              user_id: user.id,
              amount: lifetimePlan.price || 0,
              payment_method: 'crypto',
              payment_details: paymentDetails,
              plan_id: lifetimePlan.id || '',
              status: 'completed'
            }])
            .select();
            
          if (paymentError) {
            throw new Error(`Failed to record payment: ${paymentError.message}`);
          }
          
          console.log("Payment recorded successfully:", paymentData);
          paymentRecorded = true;
        } catch (error) {
          retryAttempt++;
          console.error(`Error recording payment (attempt ${retryAttempt}):`, error);
          
          // If this is the last retry and it still failed, throw the error
          if (retryAttempt >= MAX_RETRIES) {
            throw error;
          }
          
          // Wait before retrying (with exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryAttempt - 1)));
        }
      }
      
      // Activate the lifetime plan
      console.log("Activating lifetime plan for user:", user.id);
      const result = await activateLifetimePlan();
      
      if (result.success) {
        // Refresh subscription data after successful activation
        console.log("Lifetime plan activated, refreshing subscription data");
        await fetchCurrentSubscription();
        
        toast({
          title: "Lifetime Access Activated",
          description: "You now have lifetime access to all features!",
        });
        
        // Delay navigation to ensure data is properly saved
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        throw new Error(result.error?.message || "Failed to activate lifetime plan");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error upgrading plan",
        description: error.message || "There was a problem processing your payment. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    handlePaymentSuccess
  };
};
