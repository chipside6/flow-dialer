
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SupabaseDebugInfo, OperationType } from '@/utils/supabaseDebug';

interface OperationItemProps {
  operation: SupabaseDebugInfo;
}

export function OperationItem({ operation }: OperationItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getOperationColor = (type: OperationType) => {
    switch (type) {
      case OperationType.READ:
        return 'text-blue-500';
      case OperationType.WRITE:
        return 'text-green-500';
      case OperationType.DELETE:
        return 'text-red-500';
      case OperationType.UPDATE:
        return 'text-orange-500';
      case OperationType.AUTH:
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusBadge = (success: boolean) => {
    return success 
      ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Success</span>
      : <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  return (
    <Card className={operation.success ? '' : 'border-red-300'}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-2">
            <span className={`font-mono font-bold ${getOperationColor(operation.operation)}`}>
              {operation.operation}
            </span>
            {operation.table && <span className="text-sm text-muted-foreground">{operation.table}</span>}
            <span className="text-xs text-muted-foreground">{formatTime(operation.timestamp)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(operation.success)}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 space-y-2">
            {operation.error && (
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <h4 className="text-sm font-medium text-red-700">Error</h4>
                <pre className="text-xs overflow-x-auto mt-1 text-red-600">
                  {JSON.stringify(operation.error, null, 2)}
                </pre>
              </div>
            )}
            
            {operation.data && (
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <h4 className="text-sm font-medium">Data</h4>
                <pre className="text-xs overflow-x-auto mt-1">
                  {JSON.stringify(operation.data, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Auth status:</span> {operation.auth_status || 'UNKNOWN'}
              {operation.user_id && (
                <span className="ml-2">
                  <span className="font-semibold">User ID:</span> {operation.user_id}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
