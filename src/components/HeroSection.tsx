
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="pt-24 md:pt-32 pb-6 md:pb-16 px-4 md:px-10 overflow-hidden relative">
      {/* Background gradient shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-100 to-blue-50 opacity-70"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-70"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10 mb-10 md:mb-0">
            <div className="inline-block animate-fade-in">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-medium tracking-wide mb-4 mt-6">
                Modern Communication Platform
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight md:leading-tight">
              Simplify Your Calling Experience
            </h1>
            
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              A cutting-edge communication tool with a simple interface to transform the way you connect with others.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:justify-start">
              <Button size="sm" className="rounded-full px-6 bg-sky-500 hover:bg-sky-600 group" asChild>
                <Link to="/signup">
                  Try for Free
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full px-6 text-sky-700 border-sky-200 hover:bg-sky-50" asChild>
                <Link to="/features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/public/lovable-uploads/ebae8c85-b3d8-4542-8f0d-eadb9ab31801.png" 
              alt="Call center agent working at desk" 
              className="w-full max-w-md object-contain rounded-lg shadow-sm"
              width={600}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
