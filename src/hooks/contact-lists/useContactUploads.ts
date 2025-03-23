
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Papa from "papaparse";
import { Contact, ContactList, UseContactUploadsReturn } from "./types";

export const useContactUploads = (
  setLists: React.Dispatch<React.SetStateAction<ContactList[]>>,
  createContactList: (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => Promise<ContactList | null>,
  fetchContactLists: () => Promise<void>
): UseContactUploadsReturn => {
  const { user } = useAuth();

  const uploadContacts = async (file: File, listId: string): Promise<number> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload contacts",
        variant: "destructive"
      });
      return 0;
    }

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const contacts = results.data as Contact[];
            console.log("Parsed contacts:", contacts);
            
            if (contacts.length === 0) {
              reject(new Error("No contacts found in the file"));
              return;
            }
            
            // Check for required fields
            const missingFields = contacts.some(contact => 
              !contact.first_name || !contact.last_name || !contact.phone_number
            );
            
            if (missingFields) {
              reject(new Error("Some contacts are missing required fields (first_name, last_name, phone_number)"));
              return;
            }
            
            // Add contacts to the database
            let addedCount = 0;
            
            for (const contact of contacts) {
              // First create the contact
              const { data: newContact, error: contactError } = await supabase
                .from('contacts')
                .insert({
                  first_name: contact.first_name,
                  last_name: contact.last_name,
                  phone_number: contact.phone_number,
                  email: contact.email || null,
                  user_id: user.id
                })
                .select()
                .single();
              
              if (contactError) {
                console.error("Error creating contact:", contactError);
                continue;
              }
              
              // Then add to the contact list
              const { error: linkError } = await supabase
                .from('contact_list_items')
                .insert({
                  contact_list_id: listId,
                  contact_id: newContact.id
                });
              
              if (linkError) {
                console.error("Error linking contact to list:", linkError);
                continue;
              }
              
              addedCount++;
            }
            
            // Update the contact count in our local state
            setLists(prevLists => 
              prevLists.map(list => 
                list.id === listId 
                  ? { ...list, contactCount: list.contactCount + addedCount } 
                  : list
              )
            );
            
            resolve(addedCount);
          } catch (error) {
            console.error("Error processing contacts:", error);
            reject(error);
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        }
      });
    });
  };

  const uploadContactsWithNewList = async (file: File, listName: string, description?: string): Promise<void> => {
    try {
      // First create the list
      const newList = await createContactList({
        name: listName,
        description: description || ""
      });
      
      if (!newList) {
        throw new Error("Failed to create contact list");
      }
      
      // Then upload the contacts
      const count = await uploadContacts(file, newList.id);
      
      toast({
        title: "Contacts uploaded successfully",
        description: `Added ${count} contacts to "${listName}"`,
      });
      
      // Refresh the lists to get the updated count
      await fetchContactLists();
    } catch (error) {
      console.error("Error uploading contacts with new list:", error);
      throw error;
    }
  };

  return {
    uploadContacts,
    uploadContactsWithNewList
  };
};
