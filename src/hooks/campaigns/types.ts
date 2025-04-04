
// Original imports
import { User } from "@/contexts/auth/types";

export interface Campaign {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "paused" | "draft" | "active" | "failed";
  progress: number;
  totalCalls: number;
  answeredCalls: number;
  transferredCalls: number;
  failedCalls: number;
  user_id: string;
}

export interface CampaignState {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseCampaignsResult extends CampaignState {
  refreshCampaigns: () => Promise<void>;
}

export type FetchCampaignsParams = {
  user: User | null;
  isAuthenticated: boolean;
};
