
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { SupabaseDebugInfo, OperationType } from '@/utils/supabaseDebug';

interface OperationItemProps {
  op: SupabaseDebugInfo;
}

const getBadgeColor = (type: OperationType) => {
  switch(type) {
    case OperationType.READ: return "bg-blue-500";
    case OperationType.WRITE: return "bg-green-500";
    case OperationType.DELETE: return "bg-red-500";
    case OperationType.UPDATE: return "bg-yellow-500";
    case OperationType.AUTH: return "bg-purple-500";
    default: return "bg-gray-500";
  }
};

export const OperationItem: React.FC<OperationItemProps> = ({ op }) => {
  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Badge className={getBadgeColor(op.operation)}>
            {op.operation}
          </Badge>
          {op.table && (
            <span className="text-sm font-medium">{op.table}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {op.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(op.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="text-xs font-mono mt-1 text-muted-foreground">
        Auth: {op.auth_status || 'UNKNOWN'}
        {op.user_id && ` | User: ${op.user_id.substring(0, 8)}...`}
      </div>
      
      {op.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-mono overflow-x-auto">
          {typeof op.error === 'string' 
            ? op.error 
            : op.error.message || JSON.stringify(op.error, null, 2)
          }
        </div>
      )}
    </div>
  );
};
