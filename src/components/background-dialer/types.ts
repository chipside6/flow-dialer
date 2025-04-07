
export interface DialerFormData {
  contactListId: string;
  transferNumber: string;
  greetingFile?: string;
  maxConcurrentCalls: number;
  portNumber?: number; // Added port number
}

export interface DialStatus {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  totalCalls: number;
  completedCalls: number;
  answeredCalls: number;
  failedCalls: number;
}
