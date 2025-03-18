
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import CreateContactListForm from "@/components/contact-lists/CreateContactListForm";
import EmptyContactListsState from "@/components/contact-lists/EmptyContactListsState";
import ContactListsDisplay from "@/components/contact-lists/ContactListsDisplay";

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Contact Lists</h1>
              </div>
              
              <CreateContactListForm onListCreated={handleListCreated} />
              
              {lists.length === 0 ? (
                <EmptyContactListsState />
              ) : (
                <ContactListsDisplay lists={lists} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactLists;
