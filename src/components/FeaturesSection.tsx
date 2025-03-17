
import { Check } from "lucide-react";

const features = [
  {
    title: "Campaign Automation",
    description: "Set up and forget with our automated campaign system that handles calls without manual intervention.",
    icon: "🤖"
  },
  {
    title: "Real-time Analytics",
    description: "Track campaign performance with comprehensive analytics dashboards showing conversion rates and call metrics.",
    icon: "📊"
  },
  {
    title: "Intelligent Call Routing",
    description: "Route calls to the right team members based on custom rules, availability, and expertise.",
    icon: "🔄"
  },
  {
    title: "Voice Recognition",
    description: "Advanced AI analyzes call content to provide insights and automatically categorize responses.",
    icon: "🎤"
  },
  {
    title: "Multi-channel Integration",
    description: "Connect your calling campaigns with email, SMS, and other communication channels for comprehensive outreach.",
    icon: "📱"
  },
  {
    title: "Compliance Management",
    description: "Stay compliant with calling regulations with built-in compliance tools and do-not-call list integration.",
    icon: "✅"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 md:px-10 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
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
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: string;
  delay?: number;
}) => {
  return (
    <div 
      className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up opacity-0" 
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="inline-block text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
