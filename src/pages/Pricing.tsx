
import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-10 px-6 md:px-10">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              Transparent Pricing for Everyone
            </h1>
          </div>
        </section>
        
        <PricingSection />
        <TestimonialsSection />
      </main>
    </div>
  );
};

export default Pricing;
