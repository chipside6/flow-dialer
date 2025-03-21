
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneForwarded, Trash, Calendar, Phone, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TransferNumber } from "@/hooks/useTransferNumbers";

interface TransferNumbersListProps {
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  onDeleteTransferNumber: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export const TransferNumbersList = ({ 
  transferNumbers, 
  isLoading, 
  onDeleteTransferNumber,
  onRefresh
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
  
  // Handle manual refresh
  const handleRefresh = () => {
    if (onRefresh) {
      console.log("Manual refresh triggered");
      onRefresh();
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <PhoneForwarded className="mr-2 h-5 w-5" />
          Your Transfer Numbers
        </CardTitle>
        {/* Add refresh button */}
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-10 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading transfer numbers...</span>
          </div>
        ) : transferNumbers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No transfer numbers yet. Add your first transfer destination.
          </div>
        ) : (
          <div className="overflow-x-auto">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
