
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneForwarded, Trash, Calendar, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TransferNumber } from "@/hooks/useTransferNumbers";

interface TransferNumbersListProps {
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  onDeleteTransferNumber: (id: string) => Promise<boolean>;
}

export const TransferNumbersList = ({ 
  transferNumbers, 
  isLoading, 
  onDeleteTransferNumber 
}: TransferNumbersListProps) => {
  // Track which items are being deleted
  const [deletingIds, setDeletingIds] = React.useState<Set<string>>(new Set());
  
  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;
    
    setDeletingIds(prev => new Set([...prev, id]));
    
    try {
      await onDeleteTransferNumber(id);
    } catch (error) {
      console.error("Error when deleting:", error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PhoneForwarded className="mr-2 h-5 w-5" />
          Your Transfer Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading transfer numbers...</span>
          </div>
        ) : transferNumbers.length === 0 ? (
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
                      onClick={() => handleDelete(tn.id)} 
                      disabled={deletingIds.has(tn.id)}
                    >
                      {deletingIds.has(tn.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                      ) : (
                        <Trash className="h-4 w-4 text-destructive" />
                      )}
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
