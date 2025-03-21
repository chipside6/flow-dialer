
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { useSubscription } from '@/hooks/useSubscription';
import { pricingPlans } from '@/data/pricingPlans';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from './PageHeader';
import { LifetimePlanCard } from './LifetimePlanCard';
import { LoadingState } from './LoadingState';
import { PaymentSection } from './PaymentSection';

export const UpgradeContainer: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { activateLifetimePlan, fetchCurrentSubscription, isLoading: subscriptionLoading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Get only the lifetime plan
  const lifetimePlan = pricingPlans.find(plan => plan.isLifetime);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setPageLoading(true);
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade your plan",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      // Refresh subscription data when component mounts
      await fetchCurrentSubscription();
      setPageLoading(false);
    };
    
    checkAuth();
  }, [user, navigate, toast, fetchCurrentSubscription]);
  
  const handleSelectPlan = () => {
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = async (paymentDetails: any) => {
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
  
  const handleBack = () => {
    setShowPaymentForm(false);
  };
  
  const handleNavigateBack = () => {
    navigate(-1);
  };
  
  const isLoading = pageLoading || subscriptionLoading;
  
  // If we don't have the lifetime plan data yet
  if (!lifetimePlan) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Plan information not found. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader onNavigateBack={handleNavigateBack} />

      {isLoading ? (
        <LoadingState message={isProcessing ? "Processing your payment..." : "Loading your subscription data..."} />
      ) : !showPaymentForm ? (
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          <LifetimePlanCard 
            plan={lifetimePlan} 
            onSelectPlan={handleSelectPlan}
            isProcessing={isProcessing}
          />
        </div>
      ) : (
        <PaymentSection 
          onBack={handleBack}
          planPrice={lifetimePlan.price}
          planName={lifetimePlan.name}
          onPaymentComplete={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
