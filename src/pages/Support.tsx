
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-32">
        <section className="pb-16 md:pb-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              We're Here to Help
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Get the support you need with our dedicated team ready to assist you.
            </p>
          </div>
        </section>
        
        <section className="pb-24 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                <h2 className="text-2xl font-display font-bold mb-6">Contact Support</h2>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="Your email address" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" placeholder="Describe your issue or question" rows={5} />
                  </div>
                  
                  <Button type="submit" className="w-full rounded-full">
                    Send Message
                  </Button>
                </form>
              </div>
              
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    {[
                      {
                        question: "How do I reset my password?",
                        answer: "You can reset your password by clicking on the 'Forgot Password' link on the login screen and following the instructions sent to your email."
                      },
                      {
                        question: "Can I use Flow Dialer internationally?",
                        answer: "Yes, Flow Dialer works worldwide. International calling rates may apply depending on your subscription plan."
                      },
                      {
                        question: "How do I update my payment information?",
                        answer: "You can update your payment details in the Account Settings section under the Billing tab."
                      },
                      {
                        question: "Is my data secure with Dandy Dialer?",
                        answer: "Absolutely. We use end-to-end encryption for all communications and follow strict data protection protocols."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="bg-secondary/50 rounded-xl p-6">
                        <h3 className="font-medium mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-display font-bold mb-6">Additional Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Knowledge Base",
                        description: "Browse our extensive documentation"
                      },
                      {
                        title: "Video Tutorials",
                        description: "Learn with step-by-step guides"
                      },
                      {
                        title: "Community Forum",
                        description: "Connect with other users"
                      },
                      {
                        title: "System Status",
                        description: "Check our service availability"
                      }
                    ].map((resource, index) => (
                      <div key={index} className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-sm transition-all duration-200">
                        <h3 className="font-medium text-sm mb-1">{resource.title}</h3>
                        <p className="text-muted-foreground text-xs">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Support;
