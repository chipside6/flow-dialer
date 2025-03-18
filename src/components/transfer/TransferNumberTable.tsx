
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneForwarded, Trash, Calendar, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TransferNumber } from "@/types/transferNumbers";

interface TransferNumberTableProps {
  transferNumbers: TransferNumber[];
  onDeleteTransferNumber: (id: string) => void;
}

export const TransferNumberTable = ({ 
  transferNumbers, 
  onDeleteTransferNumber 
}: TransferNumberTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PhoneForwarded className="mr-2 h-5 w-5" />
          Your Transfer Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transferNumbers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No transfer numbers yet. Add your first transfer destination.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Call Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferNumbers.map((tn) => (
                <TableRow key={tn.id}>
                  <TableCell className="font-medium">{tn.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-primary" />
                      {tn.number}
                    </div>
                  </TableCell>
                  <TableCell>{tn.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDistanceToNow(tn.dateAdded, { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>{tn.callCount}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeleteTransferNumber(tn.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
