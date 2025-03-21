
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pricingPlans } from '@/data/pricingPlans';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { CryptoPaymentForm } from '@/components/payment/CryptoPaymentForm';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const UpgradePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { activateLifetimePlan, fetchCurrentSubscription, isLoading: subscriptionLoading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get only the lifetime plan
  const lifetimePlan = pricingPlans.find(plan => plan.isLifetime);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      navigate("/login");
    } else {
      // Refresh subscription data when component mounts
      fetchCurrentSubscription();
    }
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
      
      // Record the payment in the database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: lifetimePlan?.price || 0,
          payment_method: 'crypto',
          payment_details: paymentDetails,
          plan_id: lifetimePlan?.id || ''
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
          description: `You now have lifetime access to all features!`,
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
  
  // If we don't have the lifetime plan data yet
  if (!lifetimePlan) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading plan information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleNavigateBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Upgrade Your Plan</h1>
            </div>
            <p className="text-muted-foreground ml-9">Get lifetime access to all features</p>
          </div>
        </div>

        {subscriptionLoading || isProcessing ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>{isProcessing ? "Processing your payment..." : "Loading your subscription..."}</p>
            </div>
          </div>
        ) : !showPaymentForm ? (
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            <Card className="rounded-lg border border-border/70 p-6 transition-all duration-300 bg-card shadow-md">
              <CardHeader className="p-0 pb-4">
                <CardTitle>{lifetimePlan.name} Plan</CardTitle>
                <CardDescription>{lifetimePlan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 pb-6">
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold">${lifetimePlan.price}</span>
                  <span className="text-muted-foreground"> one-time payment</span>
                </div>
                
                <div className="space-y-3">
                  {lifetimePlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="p-0">
                <Button 
                  className="w-full"
                  onClick={handleSelectPlan}
                >
                  Get Lifetime Access
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              ← Back to Plan
            </Button>
            <CryptoPaymentForm 
              planPrice={lifetimePlan.price}
              planName={lifetimePlan.name}
              onPaymentComplete={handlePaymentSuccess}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UpgradePage;
