
import React from "react";
import { Circle, Check } from "lucide-react";
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
      
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold text-center">{plan.name}</CardTitle>
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
          {plan.price === 0 ? (
            <span className="text-5xl font-bold">Free</span>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`price-highlight ${plan.isLifetime ? 'animate-pulse-subtle' : ''}`}>
                <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-sky-500 relative">
                  <span className="absolute -top-5 -left-4 text-xl md:text-2xl">$</span>
                  {plan.price}
                </span>
              </div>
              {!plan.isLifetime && (
                <span className="text-xl text-primary/70 mt-2">per month</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pb-6 pt-0">
        <Button 
          className="w-full rounded-full py-6 text-lg"
          onClick={() => onSelect(plan)}
          variant={plan.isTrial ? "orange" : "default"}
        >
          {plan.isTrial ? 'Start Free Trial' : 'Get Lifetime Access'}
        </Button>
      </CardFooter>
    </Card>
  );
};
