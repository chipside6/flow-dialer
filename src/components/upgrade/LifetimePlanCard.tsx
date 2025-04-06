
import React from 'react';
import { PricingPlan } from '@/data/pricingPlans';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react';

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
    <Card className="rounded-lg border border-border/70 transition-all duration-300 bg-card shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold text-center">{plan.name} Plan</CardTitle>
        <CardDescription className="text-center text-lg mt-1">{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 py-4">        
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Circle className="h-5 w-5 text-primary/50 flex-shrink-0 mt-0.5" fill="#e6f7ff" strokeWidth={0} />
              <span className="text-base text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 mb-10 text-center">
          <div className="flex flex-col items-center">
            <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary">${plan.price}</span>
            {!plan.isLifetime && (
              <span className="text-xl text-primary/70 mt-2">per month{plan.featuresObj?.maxCalls ? `, per channel` : ''}</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pb-6 pt-0">
        <Button 
          className="w-full rounded-full py-6 text-lg"
          onClick={onSelectPlan}
          disabled={isProcessing}
        >
          Get Lifetime Access
        </Button>
      </CardFooter>
    </Card>
  );
};
