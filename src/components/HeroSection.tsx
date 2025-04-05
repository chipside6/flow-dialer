
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="py-32 md:py-40 px-6 md:px-10 overflow-hidden relative">
      {/* Background gradient shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-100 to-blue-50 opacity-70"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-70"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-2xl mx-auto z-10">
            <div className="inline-block animate-fade-in">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-medium tracking-wide mb-6">
                Modern Communication Platform
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight md:leading-tight">
              Simplify Your Calling Experience
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              A cutting-edge communication tool with a simple interface to transform the way you connect with others.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Button size="lg" className="rounded-full px-8 bg-sky-500 hover:bg-sky-600 group" asChild>
                <Link to="/signup">
                  Try for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 text-sky-700 border-sky-200 hover:bg-sky-50" asChild>
                <Link to="/features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
