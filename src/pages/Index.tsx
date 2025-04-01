
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
import PublicLayout from "@/components/layout/PublicLayout";

const Index = () => {
  return (
    <PublicLayout>
      <div className="bg-background"> 
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </div>
    </PublicLayout>
  );
};

export default Index;
