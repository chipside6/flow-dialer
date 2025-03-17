
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SquarePaymentForm } from "@/components/SquarePaymentForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Plans from the pricing section
const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    description: "Perfect for individual users",
    features: [
      "Unlimited calls",
      "5 campaigns",
      "View-only contact lists",
      "No editing of assigned campaign contacts",
      "Basic contact management",
      "Standard support"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    description: "Ideal for professionals and small teams",
    features: [
      "Unlimited calls",
      "10 campaigns",
      "View-only contact lists",
      "Advanced contact management",
      "Priority support",
      "Team management features",
      "Custom branding options"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    description: "For organizations with advanced needs",
    features: [
      "Unlimited calls",
      "Unlimited campaigns",
      "Edit or change assigned contact lists",
      "Call recording & transcription",
      "Advanced analytics",
      "Enhanced security features",
      "Dedicated account manager",
      "24/7 premium support"
    ]
  }
];

const Billing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = (paymentDetails: any) => {
    toast({
      title: "Subscription Activated",
      description: `You're now subscribed to the ${selectedPlan?.name} plan!`,
    });
    
    // In a real app, this would update the user's subscription status in the database
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`
                    rounded-2xl border border-border/70 transition-all duration-300
                    ${plan.popular 
                      ? 'bg-card shadow-lg relative scale-105 md:scale-110 z-10' 
                      : 'bg-card/50 hover:shadow-md'}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full rounded-full ${plan.popular ? '' : 'bg-primary/90 hover:bg-primary'}`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      Subscribe Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
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
      <Footer />
    </div>
  );
};

export default Billing;
