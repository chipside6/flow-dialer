
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { ContactList } from "@/hooks/useContactLists";
import { format } from "date-fns";

interface ContactListRowProps {
  list: ContactList;
  onDelete: (id: string) => void;
}

const ContactListRow: React.FC<ContactListRowProps> = ({ list, onDelete }) => {
  return (
    <TableRow key={list.id}>
      <TableCell className="font-medium whitespace-nowrap">{list.name}</TableCell>
      <TableCell className="whitespace-nowrap">{list.description}</TableCell>
      <TableCell className="whitespace-nowrap">{list.contactCount}</TableCell>
      <TableCell className="whitespace-nowrap">{format(list.dateCreated, 'PP')}</TableCell>
      <TableCell className="whitespace-nowrap">{format(list.lastModified, 'PP')}</TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDelete(list.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ContactListRow;
