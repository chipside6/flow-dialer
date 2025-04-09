
import { PostgrestError } from "@supabase/supabase-js";

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  plan_id: string;
  created_at: string;
  updated_at: string;
  trial_end?: string | null;
  trial_start?: string | null;
  current_period_end?: string | null;
  current_period_start?: string | null;
}

export interface PlanDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isLifetime: boolean;
  isTrial: boolean;
  callLimit: number;
  trialDays?: number;
}

export interface UseSubscriptionReturn {
  isLoading: boolean;
  currentPlan: string | null;
  subscription: Subscription | null;
  callCount: number;
  showLimitDialog: boolean;
  closeLimitDialog: () => void;
  fetchCurrentSubscription: () => Promise<void>;
  activateLifetimePlan: (planId?: string) => Promise<{ success: boolean; error?: Error }>;
  getPlanById: (planId: string) => PlanDetails | null;
  error: PostgrestError | Error | null;
  hasReachedLimit: boolean;
  callLimit: number;
  trialExpired: boolean;
  checkAndShowLimitDialog: () => Promise<boolean>;
  dailyCallCount: number;
  dailyCallLimit: number;
  monthlyCallCount: number;
  monthlyCallLimit: number;
}
