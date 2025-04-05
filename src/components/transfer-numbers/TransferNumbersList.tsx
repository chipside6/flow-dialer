
import React from "react";
import { TransferNumber } from "@/types/transferNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, Trash2 } from "lucide-react";
import { EmptyTransferNumbersState } from "./EmptyTransferNumbersState";

interface TransferNumbersListProps {
  transferNumbers: TransferNumber[];
  isLoading: boolean;
  error: string | null;
  onDeleteTransferNumber: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const TransferNumbersList = ({
  transferNumbers,
  isLoading,
  error,
  onDeleteTransferNumber,
  onRefresh
}: TransferNumbersListProps) => {
  // Handle empty state
  if (!isLoading && transferNumbers.length === 0) {
    return (
      <Card>
        <CardHeader className="text-left">
          <CardTitle>Your Transfer Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyTransferNumbersState 
            hasError={!!error} 
            onRefresh={onRefresh} 
          />
        </CardContent>
      </Card>
    );
  }
  
  // Display the list of transfer numbers
  return (
    <Card>
      <CardHeader className="text-left">
        <CardTitle className="flex items-center justify-between">
          <span>Your Transfer Numbers</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {transferNumbers.length > 0 ? (
          <div className="divide-y">
            {transferNumbers.map((transferNumber) => (
              <div key={transferNumber.id} className="py-4 px-6 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-semibold">{transferNumber.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-normal">{transferNumber.number}</p>
                    {transferNumber.description && (
                      <p className="text-sm whitespace-normal">{transferNumber.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      Added {formatDate(new Date(transferNumber.dateAdded))}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 self-start sm:self-center whitespace-nowrap"
                    onClick={() => onDeleteTransferNumber(transferNumber.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <EmptyTransferNumbersState 
            hasError={!!error}
            onRefresh={onRefresh}
          />
        )}
      </CardContent>
    </Card>
  );
};
