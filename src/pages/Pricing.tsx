
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
import PublicLayout from "@/components/layout/PublicLayout";

const Pricing = () => {
  return (
    <PublicLayout>
      <main>
        <PricingSection />
        <CTASection />
      </main>
    </PublicLayout>
  );
};

export default Pricing;
