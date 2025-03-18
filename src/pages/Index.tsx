
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20"> {/* Added padding to prevent content from being hidden under navbar */}
        <HeroSection />
        <div className="max-w-7xl mx-auto py-20 px-6 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Phone className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-6">Automated Dialer Solution</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start making calls today with our powerful automated dialing system. Reach more people in less time and improve your communication efficiency.
          </p>
          <Link to="/campaign">
            <Button size="lg" className="group">
              Start Dialing Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
