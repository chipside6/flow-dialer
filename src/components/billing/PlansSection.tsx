
import React from "react";
import { PlanCard } from "./PlanCard";
import { PricingPlan } from "@/data/pricingPlans";

interface PlansSectionProps {
  plans: PricingPlan[];
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PlansSection = ({ plans, onSelectPlan }: PlansSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <PlanCard 
          key={plan.id} 
          plan={plan} 
          onSelect={onSelectPlan} 
        />
      ))}
    </div>
  );
};
