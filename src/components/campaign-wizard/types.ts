
export type WizardStep =
  | 'basics'
  | 'contacts'
  | 'audio'
  | 'goip'
  | 'transfer-number'
  | 'transfers'
  | 'review';

export interface CampaignData {
  id?: string;
  title: string;
  description: string;
  greetingFileId?: string;
  transfer_number_id?: string; // Link to transfer_numbers
  transferNumber?: string; // Additional field for direct transfer number storage
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

// Add ContactList interface for components that need it
export interface ContactList {
  id: string;
  name: string;
  description?: string;
  count?: number;
  createdAt?: string;
}
