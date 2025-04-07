
/**
 * Campaign type definitions
 */

export interface Campaign {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'running' | 'pending';
  description?: string;
  greeting_file_id?: string;
  contact_list_id?: string;
  transfer_number?: string;
  schedule_date?: string;
  schedule_time?: string;
  call_count?: number;
  answer_count?: number;
  transfer_count?: number;
  updated_at?: string;
  port_number?: number;
  
  // Add these properties to support CallStatisticsCard component 
  totalCalls?: number;
  answeredCalls?: number;
  transferredCalls?: number;
  failedCalls?: number;
  progress?: number;
}

export interface CampaignState {
  campaigns: Campaign[];
  isLoading: boolean; 
  error: Error | null;
}

export interface CampaignListItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  call_count?: number;
  answer_count?: number;
  transfer_count?: number;
}

export interface CampaignFormData {
  title: string;
  description?: string;
  greeting_file_id?: string;
  contact_list_id?: string;
  transfer_number?: string;
  schedule_date?: string;
  schedule_time?: string;
  port_number?: number;
}
