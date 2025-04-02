
// If the file exists, add this type to it. If not, create it:

export type WizardStep = "basics" | "contacts" | "audio" | "transfers" | "sipProvider" | "review";

export interface CampaignData {
  id: string;
  title: string;
  description: string;
  contactListId?: string;
  greetingFileId?: string;
  transferNumber?: string;
  sipProviderId?: string;
  status?: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress?: number;
  totalCalls?: number;
  answeredCalls?: number;
  transferredCalls?: number;
  failedCalls?: number;
  dateCreated?: string;
  dateUpdated?: string;
  user_id?: string;
  schedule?: {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    timezone?: string;
  };
}
