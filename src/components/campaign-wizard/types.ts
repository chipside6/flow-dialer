
export interface CampaignData {
  id: string; // Changed from optional to required
  title: string;
  description: string;
  contactListId: string;
  greetingFileId: string;
  transferNumber: string;
  schedule: {
    startDate: string;
    timezone: string;
    maxConcurrentCalls: number;
  };
  status?: string;
  progress?: number;
  totalCalls?: number;
  answeredCalls?: number;
  transferredCalls?: number;
  failedCalls?: number;
  createdAt?: string;
  user_id?: string;
}

export type WizardStep = "basics" | "contacts" | "audio" | "transfers" | "schedule" | "review";

export interface ContactList {
  id: string;
  name: string;
}

export interface GreetingFile {
  id: string;
  name: string;
}
