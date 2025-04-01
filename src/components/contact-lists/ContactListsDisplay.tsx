
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import ContactListsTable from "./table/ContactListsTable";
import { ContactList } from "@/hooks/useContactLists";
import { Badge } from "@/components/ui/badge";

interface ContactListsDisplayProps {
  lists: ContactList[];
  onDelete: (id: string) => void;
}

const ContactListsDisplay: React.FC<ContactListsDisplayProps> = ({ lists, onDelete }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Your Contact Lists</CardTitle>
            <CardDescription className="mt-1">Manage your contact lists for campaigns</CardDescription>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto">
            {lists.length} {lists.length === 1 ? 'List' : 'Lists'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ContactListsTable lists={lists} onDelete={onDelete} />
      </CardContent>
    </Card>
  );
};

export default ContactListsDisplay;
