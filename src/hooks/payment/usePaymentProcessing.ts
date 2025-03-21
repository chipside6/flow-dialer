
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
      
      // Record the payment in the database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: lifetimePlan.price || 0,
          payment_method: 'crypto',
          payment_details: paymentDetails,
          plan_id: lifetimePlan.id || ''
        }]);
        
      if (paymentError) {
        console.error("Error recording payment:", paymentError);
        throw paymentError;
      }
      
      // Activate the lifetime plan
      const result = await activateLifetimePlan();
      
      if (result.success) {
        // Refresh subscription data after successful activation
        await fetchCurrentSubscription();
        
        toast({
          title: "Lifetime Access Activated",
          description: "You now have lifetime access to all features!",
        });
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        throw new Error("Failed to activate lifetime plan");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error upgrading plan",
        description: error.message || "There was a problem processing your payment",
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
