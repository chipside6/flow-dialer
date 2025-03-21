
import { Campaign } from "@/hooks/useCampaigns";

export interface SipProvider {
  id: string;
  name: string;
}

export interface ContactList {
  id: string;
  name: string;
  contactCount: number;
}

export interface DialStatus {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  totalCalls: number;
  completedCalls: number;
  answeredCalls: number;
  failedCalls: number;
}

export interface DialerFormData {
  sipProviderId: string;
  contactListId: string;
  transferNumber: string;
  maxConcurrentCalls: string;
  greetingFile: string;
}
