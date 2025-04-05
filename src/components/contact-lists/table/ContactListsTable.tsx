
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
    <Table className="min-w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">Name</TableHead>
          <TableHead className="whitespace-nowrap">Description</TableHead>
          <TableHead className="whitespace-nowrap">Contacts</TableHead>
          <TableHead className="whitespace-nowrap">Created</TableHead>
          <TableHead className="whitespace-nowrap">Last Modified</TableHead>
          <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
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
