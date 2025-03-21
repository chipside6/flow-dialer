
import React from 'react';
import { SupabaseDebugInfo } from '@/utils/supabaseDebug';
import { OperationItem } from './OperationItem';

interface OperationsListProps {
  operations: SupabaseDebugInfo[];
}

export const OperationsList: React.FC<OperationsListProps> = ({ operations }) => {
  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No operations recorded yet
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-2">
      {operations.map((op, i) => (
        <OperationItem key={i} op={op} />
      ))}
    </div>
  );
};
