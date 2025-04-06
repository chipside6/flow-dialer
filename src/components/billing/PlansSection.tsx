
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { PricingPlan } from "@/data/pricingPlans";

interface PlansSectionProps {
  plans: PricingPlan[];
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PlansSection = ({ plans, onSelectPlan }: PlansSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`
            rounded-2xl border border-border/70 transition-all duration-300
            ${plan.popular 
              ? 'bg-card shadow-lg relative scale-105 md:scale-110 z-10' 
              : 'bg-card/50 hover:shadow-md'}
          `}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full">
              Best Value
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">{plan.name}</CardTitle>
            <CardDescription className="text-center text-lg mt-2">{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent>            
            <div className="space-y-5 mb-8">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <Circle className="h-5 w-5 text-primary/50 flex-shrink-0" fill="#e6f7ff" strokeWidth={0} />
                  <span className="text-base text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-10 mb-6 text-center">
              {plan.price === 0 ? (
                <span className="text-5xl font-bold">Free</span>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary">${plan.price}</span>
                  {!plan.isLifetime && (
                    <span className="text-xl text-primary/70 mt-2">per month{plan.featuresObj?.maxCalls ? `, per channel` : ''}</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full rounded-full py-6 text-lg"
              onClick={() => onSelectPlan(plan)}
              variant={plan.isTrial ? "orange" : "default"}
            >
              {plan.isTrial ? 'Start Free Trial' : 'Get Lifetime Access'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
