
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
  activateLifetimePlan: (planId?: string) => Promise<{ success: boolean; error?: Error }>;
  getPlanById: (planId: string) => any;
  error: Error | null;
  hasReachedLimit: boolean;
  callLimit: number;
  trialExpired: boolean;
  checkAndShowLimitDialog: () => boolean;
}
