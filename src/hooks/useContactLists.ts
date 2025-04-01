
import { 
  useContactListsState 
} from "./contact-lists/useContactListsState";
import { 
  useContactListOperations 
} from "./contact-lists/useContactListOperations";
import { 
  useContactUploads 
} from "./contact-lists/useContactUploads";
import { 
  ContactList, 
  Contact
} from "./contact-lists/types";

export type { ContactList, Contact };

export const useContactLists = () => {
  const { 
    lists, 
    isLoading, 
    error, 
    fetchContactLists, 
    setLists 
  } = useContactListsState();

  const { 
    createContactList, 
    deleteContactList, 
    refreshLists 
  } = useContactListOperations(lists, setLists, fetchContactLists);

  const { 
    uploadContacts, 
    uploadContactsWithNewList 
  } = useContactUploads(setLists, createContactList, fetchContactLists);

  return {
    // State
    lists,
    isLoading,
    error,
    
    // Contact list operations
    createContactList,
    deleteContactList,
    refreshLists,
    
    // Contact upload operations
    uploadContacts,
    uploadContactsWithNewList
  };
};
