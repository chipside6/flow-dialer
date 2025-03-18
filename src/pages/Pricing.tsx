
import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Pricing;
