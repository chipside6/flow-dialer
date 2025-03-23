
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

const EmptyListsMessage: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-6">
        No contact lists found. Create your first list to get started.
      </TableCell>
    </TableRow>
  );
};

export default EmptyListsMessage;
