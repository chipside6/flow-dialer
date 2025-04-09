
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CallLog {
  id: string;
  phone_number: string;
  status: string;
  duration?: number;
  transfer_requested?: boolean;
  transfer_successful?: boolean;
  created_at: string;
  notes?: string;
}

export interface CallLogsTableProps {
  logs: CallLog[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

export const CallLogsTable: React.FC<CallLogsTableProps> = ({ 
  logs, 
  isLoading = false,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading call logs...</span>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No call logs available for this campaign yet.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <Badge className="bg-green-500">Answered</Badge>;
      case 'no-answer':
        return <Badge className="bg-yellow-500">No Answer</Badge>;
      case 'busy':
        return <Badge className="bg-orange-500">Busy</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'transferred':
        return <Badge className="bg-blue-500">Transferred</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      {onRefresh && (
        <div className="flex justify-end p-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Logs
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Transfer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.phone_number}</TableCell>
              <TableCell>{getStatusBadge(log.status)}</TableCell>
              <TableCell>
                {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {log.duration ? `${log.duration}s` : '-'}
              </TableCell>
              <TableCell>
                {log.transfer_requested ? (
                  log.transfer_successful ? (
                    <Badge className="bg-green-500">Successful</Badge>
                  ) : (
                    <Badge className="bg-red-500">Failed</Badge>
                  )
                ) : (
                  <Badge variant="outline">Not Requested</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
