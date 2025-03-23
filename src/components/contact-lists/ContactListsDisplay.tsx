
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { ContactList } from "@/hooks/useContactLists";
import { format } from "date-fns";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No contact lists found. Create your first list to get started.
                </TableCell>
              </TableRow>
            ) : (
              lists.map(list => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell>{list.description}</TableCell>
                  <TableCell>{list.contactCount}</TableCell>
                  <TableCell>{format(list.dateCreated, 'PP')}</TableCell>
                  <TableCell>{format(list.lastModified, 'PP')}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(list.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ContactListsDisplay;
