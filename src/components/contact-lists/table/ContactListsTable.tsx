
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import ContactListRow from "./ContactListRow";
import EmptyListsMessage from "./EmptyListsMessage";
import { ContactList } from "@/hooks/useContactLists";

interface ContactListsTableProps {
  lists: ContactList[];
  onDelete: (id: string) => void;
}

const ContactListsTable: React.FC<ContactListsTableProps> = ({ lists, onDelete }) => {
  return (
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
          <EmptyListsMessage />
        ) : (
          lists.map(list => (
            <ContactListRow 
              key={list.id}
              list={list} 
              onDelete={onDelete} 
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ContactListsTable;
