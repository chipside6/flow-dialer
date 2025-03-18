
import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";

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
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Start with our free tier or choose a premium plan that fits your needs. No trials - use the free tier with basic features as long as you want.
            </p>
          </div>
        </section>
        
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Pricing;
