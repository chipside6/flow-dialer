
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OperationItem } from './OperationItem';
import { SupabaseDebugInfo } from '@/utils/supabaseDebug';

interface OperationsListProps {
  operations: SupabaseDebugInfo[];
}

export function OperationsList({ operations }: OperationsListProps) {
  if (operations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No operations logged yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-2">
      {operations.map((operation, index) => (
        <OperationItem key={index} operation={operation} />
      ))}
    </div>
  );
}
