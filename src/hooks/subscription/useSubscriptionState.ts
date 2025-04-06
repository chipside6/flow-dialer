
import { useState, useRef } from "react";
import { Subscription } from "./types";

export const useSubscriptionState = () => {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trialExpired, setTrialExpired] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const initializedRef = useRef(false);

  return {
    currentPlan,
    setCurrentPlan,
    subscription,
    setSubscription,
    trialExpired,
    setTrialExpired,
    isInitializing,
    setIsInitializing,
    initializedRef
  };
};
