
/**
 * Campaign type definitions
 */

export interface Campaign {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  description?: string;
  greeting_file_id?: string;
  contact_list_id?: string;
  sip_provider_id?: string;
  transfer_number_id?: string;
  schedule_date?: string;
  schedule_time?: string;
  call_count?: number;
  answer_count?: number;
  transfer_count?: number;
  updated_at?: string;
}

export interface CampaignState {
  campaigns: Campaign[];
  isLoading: boolean; 
  error: Error | null;
}

export interface CampaignListItem {
  id: string;
  name: string;
  status: string;
  created_at: string;
  call_count?: number;
  answer_count?: number;
  transfer_count?: number;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  greeting_file_id?: string;
  contact_list_id?: string;
  sip_provider_id?: string;
  transfer_number_id?: string;
  schedule_date?: string;
  schedule_time?: string;
}
