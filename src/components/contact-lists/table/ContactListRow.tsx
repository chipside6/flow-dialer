
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
  );
};

export default ContactListRow;
