
export interface SipProvider {
  id: string;
  name: string;
}

export interface ContactList {
  id: string;
  name: string;
  contactCount: number;
}

export interface DialerFormData {
  sipProviderId: string;
  contactListId: string;
  transferNumber: string;
  greetingFile?: string;
  maxConcurrentCalls?: number;
}

export interface DialStatus {
  status: 'idle' | 'running' | 'stopped' | 'completed' | 'failed';
  totalCalls: number;
  completedCalls: number;
  answeredCalls: number;
  failedCalls: number;
}
