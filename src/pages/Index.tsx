
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
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

  // Header visibility enforcement
  useEffect(() => {
    console.log("Index page mounted - ensuring header is visible");
    document.body.setAttribute('data-current-route', '/');
    
    const checkHeader = () => {
      const header = document.querySelector('.sip-header');
      if (header) {
        console.log("Header element found:", header);
        if (header instanceof HTMLElement) {
          console.log("Header display style:", window.getComputedStyle(header).display);
          console.log("Header visibility style:", window.getComputedStyle(header).visibility);
          
          // Force header visibility
          header.style.display = 'block';
          header.style.visibility = 'visible';
          header.style.opacity = '1';
        }
      } else {
        console.log("Header element NOT found");
      }
    };
    
    // Check immediately and after delays to ensure header is visible
    checkHeader();
    const timer1 = setTimeout(checkHeader, 100);
    const timer2 = setTimeout(checkHeader, 500);
    const timer3 = setTimeout(checkHeader, 1000);
    
    return () => {
      document.body.removeAttribute('data-current-route');
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  console.log("Index page rendered - header should be visible");

  return (
    <div className="bg-background public-page" style={{position: 'relative'}}>
      <main className="flex-1" style={{paddingTop: 0}}> 
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
