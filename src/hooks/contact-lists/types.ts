
import { Contact } from "@/hooks/useContactLists";

export interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified?: Date;
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
