
import React from 'react';
import { PricingPlan } from '@/data/pricingPlans';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface LifetimePlanCardProps {
  plan: PricingPlan;
  onSelectPlan: () => void;
  isProcessing: boolean;
}

export const LifetimePlanCard: React.FC<LifetimePlanCardProps> = ({ 
  plan, 
  onSelectPlan,
  isProcessing
}) => {
  return (
    <Card className="rounded-lg border border-border/70 p-6 transition-all duration-300 bg-card shadow-md">
      <CardHeader className="p-0 pb-4">
        <CardTitle>{plan.name} Plan</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 pb-6">
        <div className="mt-4 mb-6 text-center">
          <span className="text-3xl font-bold">${plan.price}</span>
        </div>
        
        <div className="space-y-3">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-0">
        <Button 
          className="w-full"
          onClick={onSelectPlan}
          disabled={isProcessing}
        >
          Get Lifetime Access
        </Button>
      </CardFooter>
    </Card>
  );
};
