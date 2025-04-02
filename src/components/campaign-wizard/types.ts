
export interface CampaignData {
  id: string; // Changed from optional to required
  title: string;
  description: string;
  contactListId: string;
  greetingFileId: string;
  transferNumber: string;
  sipProviderId: string; // New field for SIP provider selection
  schedule: {
    startDate: string;
    maxConcurrentCalls: number;
  };
  status?: "pending" | "running" | "completed" | "paused";
  progress?: number;
  totalCalls?: number;
  answeredCalls?: number;
  transferredCalls?: number;
  failedCalls?: number;
  createdAt?: string;
  user_id?: string;
}

export type WizardStep = "basics" | "contacts" | "audio" | "transfers" | "sipProvider" | "review";

export interface ContactList {
  id: string;
  name: string;
}

// Updated to match the interface in useGreetingFiles.ts
export interface GreetingFile {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  duration_seconds?: number | null;
  created_at: string;
}
