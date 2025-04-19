
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransferNumber } from '@/types/transferNumber';
import { AddTransferNumberCard } from './AddTransferNumberCard';

interface TransferNumbersListProps {
  transferNumbers: TransferNumber[];
  isSubmitting: boolean;
  isLoading?: boolean;
  error?: string | null;
  onAddTransferNumber: (name: string, number: string, description: string) => Promise<any>;
  onDeleteTransferNumber: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

export const TransferNumbersList: React.FC<TransferNumbersListProps> = ({
  transferNumbers,
  isSubmitting,
  isLoading,
  error,
  onAddTransferNumber,
  onDeleteTransferNumber,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      <AddTransferNumberCard
        onAddTransferNumber={onAddTransferNumber}
        isSubmitting={isSubmitting}
      />

      {transferNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Transfer Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {transferNumbers.map((tn) => (
                <div key={tn.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{tn.name}</h3>
                    <p className="text-sm text-muted-foreground">{tn.number}</p>
                    {tn.description && (
                      <p className="text-sm text-muted-foreground mt-1">{tn.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTransferNumber(tn.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
