
import { Check } from "lucide-react";

const features = [
  {
    title: "Campaign Automation",
    description: "Set up and forget with our automated campaign system that handles calls without manual intervention.",
    icon: "🤖",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    title: "Real-time Analytics",
    description: "Track campaign performance with comprehensive analytics dashboards showing conversion rates and call metrics.",
    icon: "📊",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    title: "Intelligent Call Routing",
    description: "Route calls to the right team members based on custom rules, availability, and expertise.",
    icon: "🔄",
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    title: "Voice Recognition",
    description: "Advanced AI analyzes call content to provide insights and automatically categorize responses.",
    icon: "🎤",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    title: "Multi-channel Integration",
    description: "Connect your calling campaigns with email, SMS, and other communication channels for comprehensive outreach.",
    icon: "📱",
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    title: "Compliance Management",
    description: "Stay compliant with calling regulations with built-in compliance tools and do-not-call list integration.",
    icon: "✅",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=600&q=80"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 md:px-10 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5"></div>
        <div className="absolute -top-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our platform offers everything you need to make your calling campaigns successful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              imageUrl={feature.imageUrl}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  title, 
  description, 
  icon,
  imageUrl,
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: string;
  imageUrl: string;
  delay?: number;
}) => {
  return (
    <div 
      className="bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up opacity-0 overflow-hidden" 
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="h-40 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-6">
        <div className="inline-block text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
