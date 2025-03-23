
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import ContactListsTable from "./table/ContactListsTable";
import { ContactList } from "@/hooks/useContactLists";

interface ContactListsDisplayProps {
  lists: ContactList[];
  onDelete: (id: string) => void;
}

const ContactListsDisplay: React.FC<ContactListsDisplayProps> = ({ lists, onDelete }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Contact Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <ContactListsTable lists={lists} onDelete={onDelete} />
      </CardContent>
    </Card>
  );
};

export default ContactListsDisplay;
