
export interface CampaignData {
  id?: string; // Make id optional for creation
  title: string;
  description: string;
  contactListId: string;
  greetingFileId: string;
  transferNumber: string;
  portNumber?: number; // Added port number for GoIP
  schedule: {
    startDate: string;
    maxConcurrentCalls?: number;
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

export type WizardStep = "basics" | "contacts" | "audio" | "transfers" | "review";

export interface ContactList {
  id: string;
  name: string;
  contactCount?: number;
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
