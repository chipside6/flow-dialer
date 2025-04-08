
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { LifetimePlanCard } from './LifetimePlanCard';
import { LoadingState } from './LoadingState';
import { PaymentSection } from './PaymentSection';
import { pricingPlans } from '@/data/pricingPlans';

export const UpgradeContainer: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      
      // Simulating loading
      setTimeout(() => {
        setPageLoading(false);
      }, 1000);
    };
    
    checkAuth();
  }, [user, isAuthenticated, navigate, toast]);
  
  const handleSelectPlan = () => {
    if (!isAuthenticated || !user) {
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
    console.log("Payment completed, details:", paymentDetails);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Success!",
        description: "Your payment has been processed successfully.",
      });
      navigate("/dashboard");
    }, 2000);
  };
  
  const handleBack = () => {
    setShowPaymentForm(false);
  };
  
  const handleNavigateBack = () => {
    navigate(-1);
  };
  
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

      {pageLoading ? (
        <LoadingState message="Loading your subscription data..." />
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
