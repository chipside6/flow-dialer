
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
        <div className="max-w-7xl mx-auto py-20 px-6 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="mx-auto md:mx-0 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Phone className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Automated Dialer Solution</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0">
                Start making calls today with our powerful automated dialing system. Reach more people in less time and improve your communication efficiency.
              </p>
              <Link to="/campaign">
                <Button size="lg" className="group">
                  Start Dialing Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-3xl opacity-30"></div>
              <div className="relative bg-card p-5 rounded-2xl shadow-lg border border-border/50">
                <img 
                  src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80" 
                  alt="Call center representative using autodialer system"
                  className="rounded-xl w-full h-auto shadow-md"
                />
                <div className="absolute -bottom-3 -right-3 bg-primary/10 rounded-full p-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
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
