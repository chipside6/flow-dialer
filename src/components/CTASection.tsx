
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-24 px-6 md:px-10 bg-sky-500 text-white">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-90"></div>
        <div className="absolute inset-0 backdrop-blur-[100px]"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        {/* Abstract image overlay */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80" 
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 py-16 px-8 md:px-16 flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6 text-white">
              Ready to Transform Your Communication?
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl">
              Join thousands of satisfied users who have already enhanced their calling experience with our beautiful, intuitive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Button size="lg" variant="default" className="rounded-full px-8 bg-white text-sky-600 hover:bg-white/90 group" asChild>
                <Link to="/signup">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-white border-white/30 bg-sky-500/20 hover:bg-white/20 hover:text-white" asChild>
                <Link to="/support">
                  Contact Sales
                </Link>
              </Button>
            </div>
            
            {/* Call center illustration - visible on both mobile and desktop */}
            <div className="w-full mt-12 flex justify-center md:justify-start">
              <img 
                src="/public/lovable-uploads/8a65ed15-58e2-4a75-acc6-dfef1e6a3cc9.png" 
                alt="Call center agent working at desk" 
                className="max-w-xs md:max-w-sm rounded-lg shadow-lg border-2 border-white/20"
              />
            </div>
          </div>
          
          <div className="md:w-2/5 mt-12 md:mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=600&h=800&q=80" 
                  alt="Person using communication platform"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
