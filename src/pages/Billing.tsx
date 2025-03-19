
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SquarePaymentForm } from "@/components/SquarePaymentForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateNotice } from "@/components/billing/AffiliateNotice";
import { PlansSection } from "@/components/billing/PlansSection";
import { pricingPlans, PricingPlan } from "@/data/pricingPlans";
import { CurrentSubscription } from "@/components/billing/CurrentSubscription";
import { UpgradePlanSection } from "@/components/billing/UpgradePlanSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PaymentMethodsCard } from "@/components/profile/PaymentMethodsCard";
import { ArrowLeft } from "lucide-react";

const Billing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAffiliate, user, isAuthenticated } = useAuth();
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
      {isAuthenticated ? (
        <div className="flex flex-1 w-full">
          <DashboardLayout>
            <div className="container mx-auto py-8 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
                  </div>
                  <p className="text-muted-foreground ml-9">Manage your subscription and payment methods</p>
                </div>
              </div>

              {!showPaymentForm && (
                <Tabs defaultValue="subscription" className="w-full mb-16">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                  </TabsList>
                  <TabsContent value="subscription" className="mt-6 space-y-8">
                    <CurrentSubscription />
                    <UpgradePlanSection />
                  </TabsContent>
                  <TabsContent value="payment-methods" className="mt-6">
                    <PaymentMethodsCard />
                  </TabsContent>
                </Tabs>
              )}

              {showPaymentForm && (
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
          </DashboardLayout>
        </div>
      ) : (
        <main className="py-32 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">
                Subscription Management
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose your plan and set up recurring payments to get started.
              </p>
            </div>

            <PlansSection plans={pricingPlans} onSelectPlan={handleSelectPlan} />
          </div>
        </main>
      )}
    </div>
  );
};

export default Billing;
