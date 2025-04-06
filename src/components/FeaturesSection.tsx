
import { Check } from "lucide-react";

// Define features array with actual content
const features = [
  {
    title: "Voice Broadcasting",
    description: "Reach thousands of contacts with personalized voice messages in minutes.",
    icon: "📞",
    imageUrl: "/public/lovable-uploads/ab50b0cb-d3bc-4516-9140-d7a7a3f147d9.png"
  },
  {
    title: "Advanced Call Routing",
    description: "Route calls to the right team members with intelligent IVR systems.",
    icon: "🔄",
    imageUrl: "/public/lovable-uploads/ab50b0cb-d3bc-4516-9140-d7a7a3f147d9.png"
  },
  {
    title: "Real-time Analytics",
    description: "Monitor campaign performance with detailed analytics and reporting.",
    icon: "📊",
    imageUrl: "/public/lovable-uploads/ab50b0cb-d3bc-4516-9140-d7a7a3f147d9.png"
  },
  {
    title: "Contact Management",
    description: "Organize and manage your contact lists with easy import and export features.",
    icon: "👥",
    imageUrl: "/public/lovable-uploads/ab50b0cb-d3bc-4516-9140-d7a7a3f147d9.png"
  },
  {
    title: "Custom Greetings",
    description: "Record or upload professional greeting messages for your campaigns.",
    icon: "🎤",
    imageUrl: "/public/lovable-uploads/ab50b0cb-d3bc-4516-9140-d7a7a3f147d9.png"
  },
  {
    title: "Call Scheduling",
    description: "Schedule campaigns to run at optimal times for your audience.",
    icon: "🕒",
    imageUrl: "/public/lovable-uploads/ab50b0cb-d3bc-4516-9140-d7a7a3f147d9.png"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 px-6 md:px-10 bg-sky-50/70 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-50 to-blue-50"></div>
        <div className="absolute -top-40 right-20 w-80 h-80 bg-sky-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our platform offers everything you need to make your calling campaigns successful.
          </p>
        </div>
        
        {/* Feature cards grid */}
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
      className="bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden" 
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
