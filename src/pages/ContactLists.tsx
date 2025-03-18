
import React, { useState } from "react";
import CreateContactListForm from "@/components/contact-lists/CreateContactListForm";
import EmptyContactListsState from "@/components/contact-lists/EmptyContactListsState";
import ContactListsDisplay from "@/components/contact-lists/ContactListsDisplay";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  dateCreated: Date;
  lastModified: Date;
}

const ContactLists = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  
  const handleListCreated = (newList: ContactList) => {
    setLists([...lists, newList]);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 max-w-full pb-12">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Contact Lists</h1>
        </div>
        
        <CreateContactListForm onListCreated={handleListCreated} />
        
        {lists.length === 0 ? (
          <EmptyContactListsState />
        ) : (
          <ContactListsDisplay lists={lists} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactLists;
