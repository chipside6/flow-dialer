
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";
import Papa from "papaparse";

export interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified: Date;
}

interface Contact {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
}

export const useContactLists = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchContactLists = async () => {
    // If there's a previous request in progress, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (!user) {
      setLists([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching contact lists for user:", user.id);
      
      const { data, error } = await supabase
        .from('contact_lists')
        .select(`
          *,
          contact_list_items:contact_list_items(count)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Supabase error:", error);
        logSupabaseOperation({
          operation: OperationType.READ,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw error;
      }

      console.log("Contact lists data from DB:", data);
      logSupabaseOperation({
        operation: OperationType.READ,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        data,
        auth_status: 'AUTHENTICATED'
      });
      
      // Transform data to match ContactList interface
      const transformedData = (data || []).map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || "",
        contactCount: list.contact_list_items?.length || 0,
        dateCreated: new Date(list.created_at),
        lastModified: new Date(list.updated_at)
      }));
      
      console.log("Transformed contact lists:", transformedData);
      setLists(transformedData);
    } catch (err: any) {
      // Only set error if this request wasn't aborted
      if (err.name !== 'AbortError') {
        console.error("Error fetching contact lists:", err);
        setError(err);
        toast({
          title: "Error loading contact lists",
          description: err.message,
          variant: "destructive"
        });
      }
    } finally {
      // Set loading to false regardless
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactLists();
    
    // Safety timeout to ensure isLoading state doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Safety timeout reached, resetting loading state");
        setIsLoading(false);
      }
    }, 15000);

    return () => {
      // Clean up abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearTimeout(safetyTimeout);
    };
  }, [user]);

  const createContactList = async (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a contact list",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log("Creating contact list:", data, "for user:", user.id);
      
      const { data: newList, error } = await supabase
        .from('contact_lists')
        .insert({
          name: data.name,
          description: data.description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        logSupabaseOperation({
          operation: OperationType.WRITE,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw error;
      }

      console.log("New contact list created:", newList);
      logSupabaseOperation({
        operation: OperationType.WRITE,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        data: newList,
        auth_status: 'AUTHENTICATED'
      });
      
      const formattedList: ContactList = {
        id: newList.id,
        name: newList.name,
        description: newList.description || "",
        contactCount: 0,
        dateCreated: new Date(newList.created_at),
        lastModified: new Date(newList.updated_at)
      };

      setLists(prevLists => [...prevLists, formattedList]);
      
      return formattedList;
    } catch (err: any) {
      console.error("Error creating contact list:", err);
      throw err;
    }
  };

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

  const deleteContactList = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete a contact list",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log("Deleting contact list:", id);
      
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Supabase error:", error);
        logSupabaseOperation({
          operation: OperationType.DELETE,
          table: 'contact_lists',
          user_id: user.id,
          success: false,
          error,
          auth_status: 'AUTHENTICATED'
        });
        throw error;
      }

      logSupabaseOperation({
        operation: OperationType.DELETE,
        table: 'contact_lists',
        user_id: user.id,
        success: true,
        data: { id },
        auth_status: 'AUTHENTICATED'
      });
      
      setLists(lists.filter(list => list.id !== id));
      
      toast({
        title: "Contact list deleted",
        description: "The contact list has been removed",
      });
      
      return true;
    } catch (err: any) {
      console.error("Error deleting contact list:", err);
      toast({
        title: "Error deleting list",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const refreshLists = () => {
    fetchContactLists();
  };

  return {
    lists,
    isLoading,
    error,
    createContactList,
    deleteContactList,
    uploadContacts,
    uploadContactsWithNewList,
    refreshLists
  };
};
