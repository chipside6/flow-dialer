
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

  // Ensure body has proper overflow settings
  useEffect(() => {
    // Allow scrolling on the index page
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      // Restore default settings when unmounting
      document.body.style.overflowY = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <SipHeader />
      <main className="flex-1 pt-6 md:pt-8 overflow-y-auto"> 
        <div className="px-4 md:px-0">
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
          <CTASection />
        </div>
      </main>
    </div>
  );
};

export default Index;
