
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SquarePaymentForm } from "@/components/SquarePaymentForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateNotice } from "@/components/billing/AffiliateNotice";
import { PlansSection } from "@/components/billing/PlansSection";
import { pricingPlans, PricingPlan } from "@/data/pricingPlans";

const Billing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAffiliate, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = async (paymentDetails: any) => {
    toast({
      title: "Subscription Activated",
      description: `You're now subscribed to the ${selectedPlan?.name} plan!`,
    });
    
    // In a real app, save subscription to database
    if (user && selectedPlan) {
      try {
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } catch (error) {
        console.error("Error saving subscription:", error);
      }
    }
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };
  
  const handlePaymentError = (error: any) => {
    console.error("Payment failed:", error);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };
  
  const handleBack = () => {
    setShowPaymentForm(false);
  };

  // If user is an affiliate, show a message and redirect to dashboard
  if (isAffiliate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-32 px-6 md:px-10">
          <AffiliateNotice />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
              Subscribe to a Plan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your plan and set up recurring payments to get started.
            </p>
          </div>

          {!showPaymentForm ? (
            <PlansSection plans={pricingPlans} onSelectPlan={handleSelectPlan} />
          ) : (
            <div className="max-w-md mx-auto">
              <Button variant="outline" onClick={handleBack} className="mb-6">
                ← Back to Plans
              </Button>
              <SquarePaymentForm 
                amount={selectedPlan?.price || 0}
                planName={selectedPlan?.name || ""}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Billing;
