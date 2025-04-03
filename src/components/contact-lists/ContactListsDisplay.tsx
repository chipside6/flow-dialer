
import React, { memo } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

interface ContactListsDisplayProps {
  lists: ContactList[];
  onDelete: (id: string) => void;
}

// Use memo to prevent unnecessary re-renders when props haven't changed
const ContactListsDisplay: React.FC<ContactListsDisplayProps> = memo(({ lists, onDelete }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`mt-6 ${isMobile ? 'px-0' : ''}`}>
      <CardHeader className={isMobile ? 'px-3 py-4' : ''}>
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
      <CardContent className={isMobile ? 'px-2' : ''}>
        <ContactListsTable lists={lists} onDelete={onDelete} />
      </CardContent>
    </Card>
  );
});

// Add display name for debugging purposes
ContactListsDisplay.displayName = "ContactListsDisplay";

export default ContactListsDisplay;
