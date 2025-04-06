
import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/data/pricingPlans";

interface PlanCardProps {
  plan: PricingPlan;
  onSelect: (plan: PricingPlan) => void;
}

export const PlanCard = ({ plan, onSelect }: PlanCardProps) => {
  return (
    <Card 
      className={`
        rounded-2xl border border-border/70 transition-all duration-300
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
      
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mt-6 mb-8 text-center">
          <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary">${plan.price}</span>
          {!plan.isLifetime && <span className="text-muted-foreground">/month</span>}
        </div>
        
        <div className="space-y-4">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={`w-full rounded-full ${plan.popular ? '' : 'bg-primary/90 hover:bg-primary'}`}
          onClick={() => onSelect(plan)}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};
