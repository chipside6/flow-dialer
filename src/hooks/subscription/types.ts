
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

export interface UseSubscriptionReturn {
  isLoading: boolean;
  currentPlan: string | null;
  subscription: Subscription | null;
  callCount: number;
  showLimitDialog: boolean;
  closeLimitDialog: () => void;
  fetchCurrentSubscription: () => Promise<Subscription | null>;
  activateLifetimePlan: () => Promise<any>;
  getPlanById: (planId: string) => any;
  error: any;
  hasReachedLimit: boolean;
  callLimit: number;
}
