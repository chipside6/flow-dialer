
import { SipProvider } from "@/types/sipProviders";

export interface SipProviderApiResponse {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  description?: string;
  active: boolean;
  created_at: string;
  user_id: string;
}

export interface SipProviderState {
  providers: SipProvider[];
  setProviders: React.Dispatch<React.SetStateAction<SipProvider[]>>;
  editingProvider: SipProvider | null;
  setEditingProvider: React.Dispatch<React.SetStateAction<SipProvider | null>>;
  isLoading: boolean;
  error: Error | null;
}

export interface SipProviderActions {
  handleAddProvider: (providerData: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>) => Promise<void>;
  handleEditProvider: (provider: SipProvider) => void;
  handleCancelEdit: () => void;
  handleDeleteProvider: (id: string) => Promise<void>;
  toggleProviderStatus: (id: string) => Promise<void>;
}

export type UseSipProvidersReturn = Omit<SipProviderState, 'setProviders' | 'setEditingProvider'> & SipProviderActions;
