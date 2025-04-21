export type WizardStep = 'basics' | 'contacts' | 'audio' | 'goip' | 'transfers' | 'review';

export interface CampaignData {
  id?: string;
  title: string;
  description: string;
  greetingFileId?: string;
  transferNumber?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
  user_id?: string;
  totalCalls?: number;
  answeredCalls?: number;
  transferredCalls?: number;
  failedCalls?: number;
  contactListId?: string;
  portNumber?: number;
  goip_device_id?: string;
  port_ids?: string[];
  schedule?: {
    startDate: string;
    maxConcurrentCalls: number;
  };
}
