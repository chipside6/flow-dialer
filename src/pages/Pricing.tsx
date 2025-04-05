
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import PublicLayout from "@/components/layout/PublicLayout";

const Pricing = () => {
  return (
    <PublicLayout>
      <main>
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </PublicLayout>
  );
};

export default Pricing;
