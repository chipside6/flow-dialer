
/**
 * Campaign types for hooks
 */
import { Campaign } from '@/types/campaign';

export interface CampaignState {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseCampaignsResult extends CampaignState {
  refreshCampaigns: () => Promise<boolean>;
}

export interface FetchCampaignsParams {
  user: any;
  isAuthenticated: boolean;
}

export interface FetchCampaignsResult {
  data: Campaign[];
  error: Error | null;
  isAuthError: boolean;
  isTimeoutError: boolean;
}

// Re-export Campaign type for backward compatibility
export type { Campaign };
