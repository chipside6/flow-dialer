
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PricingPlan } from "@/data/pricingPlans";
import { useSubscription } from "@/hooks/useSubscription";

interface PlansSectionProps {
  plans: PricingPlan[];
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PlansSection = ({ plans, onSelectPlan }: PlansSectionProps) => {
  const { currentPlan } = useSubscription();
  
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
            <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full">
              Best Value
            </div>
          )}
          
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              {plan.price === 0 ? (
                <span className="text-4xl font-bold">Free</span>
              ) : (
                <div className="flex items-end">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1 mb-1">one-time</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
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
              onClick={() => onSelectPlan(plan)}
              disabled={currentPlan === plan.id}
            >
              {currentPlan === plan.id ? "Current Plan" : plan.price === 0 ? "Sign Up Free" : "Get Lifetime Access"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
