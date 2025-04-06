
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
    <Card className="rounded-lg border border-border/70 transition-all duration-300 bg-card shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl md:text-3xl font-bold text-center">{plan.name} Plan</CardTitle>
        <CardDescription className="text-center text-base md:text-lg mt-1">{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6 py-3 md:py-4 flex-grow">        
        <div className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 md:gap-3">
              <Circle className="h-4 w-4 md:h-5 md:w-5 text-primary/50 flex-shrink-0 mt-0.5" fill="#e6f7ff" strokeWidth={0} />
              <span className="text-sm md:text-base text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-auto text-center mb-6">
          <div className="flex flex-col items-center">
            <span className="text-primary text-5xl font-bold mb-2">
              <span className="text-3xl align-top mr-1">$</span>
              {plan.price}
            </span>
            {!plan.isLifetime && (
              <span className="text-lg md:text-xl text-primary/70 mt-2">per month{plan.featuresObj?.maxCalls ? `, per channel` : ''}</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pb-4 md:pb-6 pt-4">
        <Button 
          className="w-full rounded-full py-4 md:py-6 text-base md:text-lg"
          onClick={onSelectPlan}
          disabled={isProcessing}
        >
          Get Lifetime Access
        </Button>
      </CardFooter>
    </Card>
  );
};
