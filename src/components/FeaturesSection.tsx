
import { Check } from "lucide-react";

const features = [
  {
    title: "Seamless Calling",
    description: "Make crystal-clear calls to anyone, anywhere with our state-of-the-art audio technology.",
    icon: "📱"
  },
  {
    title: "Smart Contact Management",
    description: "Organize your contacts with intelligent grouping and instant search capabilities.",
    icon: "👥"
  },
  {
    title: "Personalized Experience",
    description: "Customize your interface and settings to match your unique communication style.",
    icon: "✨"
  },
  {
    title: "Secure Conversations",
    description: "End-to-end encryption ensures your calls and messages remain private and secure.",
    icon: "🔒"
  },
  {
    title: "Cross-Platform Sync",
    description: "Seamlessly transition between devices without missing a beat in your conversations.",
    icon: "🔄"
  },
  {
    title: "Smart Notifications",
    description: "Receive intelligent alerts that know when not to disturb you.",
    icon: "🔔"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 md:px-10 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Designed for How You Communicate Today
          </h2>
          <p className="text-lg text-muted-foreground mb-16">
            Every feature is thoughtfully crafted to enhance your calling experience with beautiful, intuitive design.
          </p>
        </div>
        
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
        
        <div className="mt-24 bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-6">
                All the Essential Features You Need
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                We've packed Dandy Dialer with everything you need for efficient and enjoyable communication.
              </p>
              
              <div className="space-y-4">
                {[
                  "Intuitive dialing interface",
                  "Smart contact suggestions",
                  "Call recording and transcription",
                  "Voice message capabilities",
                  "Custom call routing",
                  "Advanced privacy controls"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl opacity-30"></div>
              <div className="relative bg-card rounded-2xl overflow-hidden border border-white/20 aspect-video shadow-lg">
                <div className="w-full h-full bg-gradient-to-b from-secondary/50 to-background p-6 flex items-center justify-center">
                  <div className="text-6xl animate-float">📱</div>
                </div>
              </div>
            </div>
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
