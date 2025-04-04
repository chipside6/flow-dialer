
export interface Campaign {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "paused";
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
