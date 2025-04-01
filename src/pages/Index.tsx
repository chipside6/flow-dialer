
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";

console.log('🔍 Index page is being imported');

const Index = () => {
  console.log('🔍 Index page is rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main> 
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
    </div>
  );
};

console.log('🔍 Index page has been defined');

export default Index;
