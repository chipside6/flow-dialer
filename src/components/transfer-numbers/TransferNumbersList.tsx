
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneForwarded, Trash, Calendar, Phone, RefreshCw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TransferNumber } from "@/hooks/useTransferNumbers";

interface TransferNumbersListProps {
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  error?: string | null;
  onDeleteTransferNumber: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export const TransferNumbersList = ({ 
  transferNumbers, 
  isLoading, 
  error,
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
  
  // Handle manual refresh with debounce to prevent multiple clicks
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const handleRefresh = () => {
    if (isRefreshing || !onRefresh) return;
    
    setIsRefreshing(true);
    console.log("Manual refresh triggered");
    onRefresh();
    
    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
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
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            className="ml-auto"
          >
            {isLoading || isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden md:inline">Refresh</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-10 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading transfer numbers...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-10 space-y-2 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <span>{error}</span>
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="mt-2"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            )}
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
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Added</TableHead>
                  <TableHead className="hidden md:table-cell">Call Count</TableHead>
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
                    <TableCell className="hidden md:table-cell">{tn.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(tn.dateAdded, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{tn.callCount}</TableCell>
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
