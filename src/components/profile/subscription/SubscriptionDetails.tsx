
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionLoading } from "./SubscriptionLoading";
import { ExpiredTrialView } from "./ExpiredTrialView";
import { LifetimePlanView } from "./LifetimePlanView";
import { TrialPlanView } from "./TrialPlanView";

export function SubscriptionDetails() {
  const { isLoading, currentPlan, subscription, getPlanById } = useSubscription();
  
  const activePlan = currentPlan ? getPlanById(currentPlan) : null;

  if (isLoading) {
    return <SubscriptionLoading />;
  }

  // If no plan is found, show trial expired view with upgrade option
  if (!currentPlan || !activePlan) {
    return <ExpiredTrialView />;
  }

  // If user has lifetime plan
  if (activePlan.isLifetime) {
    return <LifetimePlanView activePlan={activePlan} />;
  }

  // For trial plan
  if (activePlan.isTrial) {
    return <TrialPlanView activePlan={activePlan} subscription={subscription} />;
  }

  // Fallback (should not be reached with only trial and lifetime)
  return null;
}
