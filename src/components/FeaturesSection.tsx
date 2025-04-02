import { Check } from "lucide-react";

const features = [
  // The three features below have been removed as requested:
  // - Campaign Automation
  // - Real-time Analytics
  // - Compliance Management
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 md:px-10 bg-secondary/10 relative overflow-hidden">
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
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* Empty features grid since we removed all features */}
          <div className="text-center text-muted-foreground">
            Custom calling solutions that work for your business
          </div>
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
