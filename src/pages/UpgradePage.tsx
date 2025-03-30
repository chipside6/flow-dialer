
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { pricingPlans, PricingPlan } from "@/data/pricingPlans";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft, Check } from "lucide-react";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";
import { usePaymentProcessing } from '@/hooks/payment/usePaymentProcessing';

const UpgradePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { isProcessing, handlePaymentSuccess } = usePaymentProcessing();
  
  // Get only the lifetime plan
  const lifetimePlan = pricingPlans.find(plan => plan.isLifetime);
  
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
    if (lifetimePlan) {
      await handlePaymentSuccess(paymentDetails, lifetimePlan);
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
            <p>Plan information not found. Please try again later.</p>
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

        {!showPaymentForm ? (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              <div
                className="rounded-lg border border-border/70 p-6 transition-all duration-300 bg-card shadow-md"
              >
                <h3 className="text-xl font-semibold">{lifetimePlan.name} Plan</h3>
                <p className="text-muted-foreground text-sm mt-1">{lifetimePlan.description}</p>
                
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold">${lifetimePlan.price}</span>
                  <span className="text-muted-foreground"> one-time payment</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  {lifetimePlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleSelectPlan}
                  disabled={isProcessing}
                >
                  Get Lifetime Access
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              ← Back to Plan
            </Button>
            <CryptoPaymentForm 
              planPrice={lifetimePlan.price}
              planName={lifetimePlan.name}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UpgradePage;
