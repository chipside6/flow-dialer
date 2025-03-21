
import { PricingPlan } from "@/data/pricingPlans";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionState {
  isLoading: boolean;
  currentPlan: string | null;
  subscription: Subscription | null;
  callCount: number;
  showLimitDialog: boolean;
}

export interface SubscriptionActions {
  closeLimitDialog: () => void;
  fetchCurrentSubscription: () => Promise<Subscription | null>;
  activateLifetimePlan: () => Promise<{ 
    success: boolean; 
    plan?: PricingPlan;
    error?: { 
      message: string 
    };
  }>;
  getPlanById: (planId: string) => PricingPlan | undefined;
}

export type UseSubscriptionReturn = SubscriptionState & SubscriptionActions;
