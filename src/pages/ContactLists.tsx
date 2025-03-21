
import React from "react";
import CreateContactListForm from "@/components/contact-lists/CreateContactListForm";
import EmptyContactListsState from "@/components/contact-lists/EmptyContactListsState";
import ContactListsDisplay from "@/components/contact-lists/ContactListsDisplay";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useContactLists } from "@/hooks/useContactLists";
import { Loader2 } from "lucide-react";

const ContactLists = () => {
  const { lists, isLoading, createContactList, deleteContactList } = useContactLists();
  
  return (
    <DashboardLayout>
      <div className="container-fluid overflow-x-hidden w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Contact Lists</h1>
        </div>
        
        <CreateContactListForm onListCreated={createContactList} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lists.length === 0 ? (
          <EmptyContactListsState />
        ) : (
          <ContactListsDisplay lists={lists} onDelete={deleteContactList} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactLists;
