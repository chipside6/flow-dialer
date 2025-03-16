
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Bitcoin, CreditCard } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

const plans = [
  {
    name: "Personal",
    price: 9,
    description: "Perfect for individual users",
    features: [
      "Unlimited calls within the network",
      "Up to 5 hours of external calls",
      "Basic contact management",
      "Core calling features",
      "Standard support"
    ]
  },
  {
    name: "Professional",
    price: 19,
    description: "Ideal for professionals and small teams",
    features: [
      "Unlimited calls",
      "Advanced contact management",
      "Call recording & transcription",
      "Priority support",
      "Team management features",
      "Custom branding options"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 49,
    description: "For organizations with advanced needs",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics",
      "Enhanced security features",
      "Service level agreement",
      "24/7 premium support"
    ]
  }
];

const cryptocurrencies = [
  { id: "btc", name: "Bitcoin (BTC)", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  { id: "eth", name: "Ethereum (ETH)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
  { id: "usdt", name: "Tether (USDT)", address: "TQVxjCcUQhBfxBZBUNHv55RfxFsjhQ8Lfz" },
];

export const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>(cryptocurrencies[0].id);
  
  const handleGetStarted = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
  };
  
  const handleCryptoPayment = () => {
    const crypto = cryptocurrencies.find(c => c.id === selectedCrypto);
    navigator.clipboard.writeText(crypto?.address || "");
    toast.success("Wallet address copied to clipboard", {
      description: "Please complete your payment and contact support with your transaction ID"
    });
  };

  return (
    <section className="py-24 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works best for your communication needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`
                rounded-2xl p-8 border border-border/70 transition-all duration-300
                ${plan.popular 
                  ? 'bg-card shadow-lg relative scale-105 md:scale-110 z-10' 
                  : 'bg-card/50 hover:shadow-md'}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              
              <div className="mt-6 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className={`w-full rounded-full ${plan.popular ? '' : 'bg-primary/90 hover:bg-primary'}`}
                    onClick={() => handleGetStarted(plan)}
                  >
                    Get Started
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Choose Payment Method</DialogTitle>
                    <DialogDescription>
                      Select your preferred payment method for the {plan.name} plan at ${plan.price}/month.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-24 space-y-2"
                      asChild
                    >
                      <a href="/signup">
                        <CreditCard className="h-8 w-8 mb-2" />
                        <span>Credit Card</span>
                      </a>
                    </Button>
                    
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-24 space-y-2"
                        onClick={() => handleGetStarted(plan)}
                      >
                        <Bitcoin className="h-8 w-8 mb-2" />
                        <span>Cryptocurrency</span>
                      </Button>
                    </DialogTrigger>
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="mt-8 space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <Dialog>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cryptocurrency Payment</DialogTitle>
              <DialogDescription>
                {selectedPlan && `Complete your payment for the ${selectedPlan.name} plan at $${selectedPlan.price}/month.`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="crypto-select" className="text-sm font-medium">
                  Select Cryptocurrency
                </label>
                <Select 
                  defaultValue={selectedCrypto} 
                  onValueChange={setSelectedCrypto}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptocurrencies.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.id}>
                        {crypto.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={cryptocurrencies.find(c => c.id === selectedCrypto)?.address} 
                    className="font-mono text-sm"
                  />
                  <Button size="sm" onClick={handleCryptoPayment}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Send the exact amount to this wallet address. After payment, please contact our support team with your transaction ID.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={handleCryptoPayment}>
                Copy Address & Complete Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for your specific requirements?{' '}
            <a href="/contact" className="text-primary hover:underline">Contact our sales team</a>.
          </p>
        </div>
      </div>
    </section>
  );
};
