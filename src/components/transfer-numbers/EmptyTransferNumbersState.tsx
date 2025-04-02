
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";

interface EmptyTransferNumbersStateProps {
  hasError: boolean;
  onRefresh: () => void;
}

export const EmptyTransferNumbersState = ({ hasError, onRefresh }: EmptyTransferNumbersStateProps) => {
  return (
    <div className="py-8 text-left">
      <h3 className="text-lg font-medium">No transfer numbers found</h3>
      
      {hasError ? (
        <div className="mt-2 space-y-4">
          <p className="text-muted-foreground">
            There was a problem loading your transfer numbers. Please try refreshing.
          </p>
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      ) : (
        <div className="mt-2 space-y-4">
          <p className="text-muted-foreground">
            Add your first transfer number using the form above.
          </p>
          <p className="text-sm text-muted-foreground">
            Transfer numbers are used when call recipients want to be transferred to speak with someone.
          </p>
          <div className="flex items-center text-primary text-sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            <span>Use the "Add New Transfer Number" form above to get started</span>
          </div>
        </div>
      )}
    </div>
  );
};
