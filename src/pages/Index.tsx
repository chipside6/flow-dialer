
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
import { SipHeader } from "@/components/header/SipHeader";
import { useAuth } from "@/contexts/auth";

const Index = () => {
  const { isAuthenticated, initialized } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && initialized) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, initialized]);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <SipHeader />
      <main className="flex-1 pt-6 md:pt-10"> 
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
