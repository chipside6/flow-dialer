
import { FeaturesSection } from "@/components/FeaturesSection";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AudioWaveform, ContactIcon, PhoneForwarded, Server, BarChart3 } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const Features = () => {
  const coreFeatures = [
    {
      title: "Greeting Management",
      description: "Upload and manage custom greeting messages for your campaigns. Set the perfect tone with professional audio files.",
      icon: <AudioWaveform className="h-12 w-12 text-primary mb-4" />,
      link: "/greetings"
    },
    {
      title: "Contact Lists",
      description: "Organize your leads and contacts into manageable lists. Import from CSV or add them manually for targeted campaigns.",
      icon: <ContactIcon className="h-12 w-12 text-primary mb-4" />,
      link: "/contacts"
    },
    {
      title: "Transfer Destinations",
      description: "Set up transfer numbers to direct calls to the right representatives or departments when needed.",
      icon: <PhoneForwarded className="h-12 w-12 text-primary mb-4" />,
      link: "/transfers"
    },
    {
      title: "SIP Trunk Configuration",
      description: "Connect with leading SIP providers to handle your outbound calls with enterprise-grade reliability.",
      icon: <Server className="h-12 w-12 text-primary mb-4" />,
      link: "/sip-providers"
    },
    {
      title: "Campaign Dashboard",
      description: "Monitor all your campaigns in real-time with detailed analytics on call performance and conversion rates.",
      icon: <BarChart3 className="h-12 w-12 text-primary mb-4" />,
      link: "/dashboard"
    }
  ];

  return (
    <PublicLayout>
      <main>
        <section className="pt-32 pb-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              Features that Elevate Your Experience
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover all the powerful capabilities designed to transform your communication.
            </p>
          </div>
        </section>
        
        <section className="py-20 px-6 md:px-10 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run successful calling campaigns and manage your communications
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <div key={index} className="bg-card border rounded-xl shadow-sm p-8 text-center hover:shadow-md transition-shadow">
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <Link to={feature.link}>
                    <Button variant="outline" className="w-full">Explore</Button>
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <Link to="/dashboard">
                <Button size="lg" className="mx-auto">
                  Explore All Features
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <FeaturesSection />
        <CTASection />
      </main>
    </PublicLayout>
  );
};

export default Features;
