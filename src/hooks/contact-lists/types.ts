
import { User } from "@supabase/supabase-js";

export interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified: Date;
}

export interface Contact {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
}

export interface ContactListsState {
  lists: ContactList[];
  isLoading: boolean;
  error: Error | null;
}

export interface UseContactListsOperationsReturn {
  createContactList: (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => Promise<ContactList | null>;
  deleteContactList: (id: string) => Promise<boolean>;
  refreshLists: () => void;
}

export interface UseContactUploadsReturn {
  uploadContacts: (file: File, listId: string) => Promise<number>;
  uploadContactsWithNewList: (file: File, listName: string, description?: string) => Promise<void>;
}
