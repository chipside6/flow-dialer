
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { useSubscription } from '@/hooks/subscription';
import { pricingPlans } from '@/data/pricingPlans';
import { Loader2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { LifetimePlanCard } from './LifetimePlanCard';
import { LoadingState } from './LoadingState';
import { PaymentSection } from './PaymentSection';
import { usePaymentProcessing } from '@/hooks/payment/usePaymentProcessing';

export const UpgradeContainer: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { fetchCurrentSubscription, isLoading: subscriptionLoading } = useSubscription();
  const { isProcessing, handlePaymentSuccess } = usePaymentProcessing();
  const [pageLoading, setPageLoading] = useState(true);
  
  // Get only the lifetime plan
  const lifetimePlan = pricingPlans.find(plan => plan.isLifetime);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setPageLoading(true);
      
      if (!isAuthenticated || !user) {
        console.log("User not authenticated, redirecting to login");
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade your plan",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      console.log("User authenticated, fetching subscription data");
      // Refresh subscription data when component mounts
      await fetchCurrentSubscription();
      setPageLoading(false);
    };
    
    checkAuth();
  }, [user, isAuthenticated, navigate, toast, fetchCurrentSubscription]);
  
  const handleSelectPlan = () => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated when selecting plan, redirecting to login");
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setShowPaymentForm(true);
  };
  
  const handlePaymentComplete = async (paymentDetails: any) => {
    console.log("Payment completed, processing payment data", paymentDetails);
    await handlePaymentSuccess(paymentDetails, lifetimePlan);
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
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};
