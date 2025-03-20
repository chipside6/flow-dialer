
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateNotice } from "@/components/billing/AffiliateNotice";
import { PlansSection } from "@/components/billing/PlansSection";
import { pricingPlans, PricingPlan } from "@/data/pricingPlans";
import { CurrentSubscription } from "@/components/billing/CurrentSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft, Check } from "lucide-react";
import { CryptoPaymentForm } from "@/components/payment/CryptoPaymentForm";

const Billing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAffiliate, user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.id === "free") {
      // Free plan doesn't need payment
      toast({
        title: "Free Plan Activated",
        description: "You've been signed up for the free plan.",
      });
      navigate("/dashboard");
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = async (paymentDetails: any) => {
    toast({
      title: "Lifetime Access Activated",
      description: `You now have lifetime access to all features!`,
    });
    
    // In a real app, save subscription to database
    if (user && selectedPlan) {
      try {
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          status: 'active',
          current_period_end: null // Null for lifetime plans
        });
      } catch (error) {
        console.error("Error saving subscription:", error);
      }
    }

    // Send welcome email (this would be handled by a backend function in a real app)
    if (user) {
      console.log(`Sending welcome email to: ${user.email}`);
      // In a real implementation, you would trigger an email send here
    }
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
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
                  <p className="text-muted-foreground ml-9">Manage your plan</p>
                </div>
              </div>

              {!showPaymentForm && (
                <Tabs defaultValue="plan" className="w-full mb-16">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-1">
                    <TabsTrigger value="plan">Your Plan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="plan" className="mt-6 space-y-8">
                    <CurrentSubscription />
                    
                    <div id="upgrade-plans" className="mt-8">
                      <h2 className="text-2xl font-bold mb-6">Get Lifetime Access</h2>
                      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
                        {pricingPlans.filter(plan => plan.isLifetime).map((plan) => (
                          <div
                            key={plan.id}
                            className="rounded-lg border border-border/70 p-6 transition-all duration-300 bg-card shadow-md"
                          >
                            <h3 className="text-xl font-semibold">{plan.name} Plan</h3>
                            <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                            
                            <div className="mt-4 mb-6">
                              <span className="text-3xl font-bold">${plan.price}</span>
                              <span className="text-muted-foreground"> one-time payment</span>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                              {plan.features.map((feature, idx) => (
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
                              onClick={() => handleSelectPlan(plan)}
                            >
                              Get Lifetime Access
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {showPaymentForm && (
                <div className="max-w-md mx-auto">
                  <Button variant="outline" onClick={handleBack} className="mb-6">
                    ← Back to Plans
                  </Button>
                  <CryptoPaymentForm 
                    planPrice={selectedPlan?.price || 199}
                    planName={selectedPlan?.name || "Lifetime"}
                    onPaymentComplete={handlePaymentSuccess}
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
                Get Lifetime Access
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Pay once and use forever. No subscriptions, no recurring fees.
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
