
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  const phoneRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (phoneRef.current) {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        
        const moveX = (clientX - innerWidth / 2) / 50;
        const moveY = (clientY - innerHeight / 2) / 50;
        
        phoneRef.current.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <section className="pt-32 pb-20 px-6 md:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-block animate-fade-in">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide mb-6">
                Modern Communication Platform
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight md:leading-tight animate-slide-up">
              Simplify Your Calling Experience
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground animate-slide-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              A cutting-edge communication tool designed with a beautiful interface to transform the way you connect with others.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <Button size="lg" className="rounded-full px-8 group" asChild>
                <Link to="/signup">
                  Try for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                <Link to="/features">
                  Learn More
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-muted-foreground animate-slide-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              No credit card required
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md lg:max-w-xl mx-auto" ref={phoneRef}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '6s' }}></div>
              <div className="relative p-4 bg-card rounded-3xl shadow-2xl border border-white/20 animate-scale-in transform-gpu">
                <div className="aspect-[1/2] rounded-2xl overflow-hidden border border-border/50 bg-background">
                  <div className="w-full h-full bg-gradient-to-b from-secondary/50 to-background p-4">
                    <div className="w-1/2 h-6 bg-primary/5 rounded-full mb-3"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-primary/10"></div>
                          <div className="flex-1">
                            <div className="h-3 w-24 bg-primary/10 rounded-full"></div>
                            <div className="h-2 w-32 bg-primary/5 rounded-full mt-2"></div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
