
import { useRef, useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "Flow Dialer has completely transformed how I stay in touch with clients. The interface is beautiful and the call quality is exceptional.",
    author: "Sarah Johnson",
    role: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
  },
  {
    quote: "I've tried many calling apps, but nothing comes close to the elegance and functionality of Flow Dialer. It's in a league of its own.",
    author: "Michael Chen",
    role: "Product Designer",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
  },
  {
    quote: "The attention to detail in Flow Dialer is remarkable. Every interaction feels intentional and delightful. It's a joy to use daily.",
    author: "Emily Rodriguez",
    role: "UX Researcher",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
  },
  {
    quote: "As someone who makes dozens of calls daily, I can't imagine going back to any other platform. Flow Dialer is simply perfect.",
    author: "David Wilson",
    role: "Sales Executive",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
  }
];

export const TestimonialsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-24 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Loved by People Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied users who have transformed their communication experience with Flow Dialer.
          </p>
        </div>
        
        <div ref={containerRef} className="relative px-8">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`
                  bg-card rounded-2xl p-6 border border-border/50 shadow-sm transition-all duration-500
                  ${index === activeIndex ? 'scale-105 shadow-lg bg-white' : 'hover:shadow-md'}
                `}
                onClick={() => setActiveIndex(index)}
              >
                <div className="flex items-start mb-6">
                  <div className="text-3xl mr-2">"</div>
                  <p className="text-sm leading-relaxed">{testimonial.quote}</p>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-sm">{testimonial.author}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                index === activeIndex ? 'bg-primary w-4' : 'bg-primary/30'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
