
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, Filter } from 'lucide-react';
import { format } from 'date-fns';

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

interface CallLogsTableProps {
  logs: CallLog[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export const CallLogsTable: React.FC<CallLogsTableProps> = ({ 
  logs, 
  onRefresh,
  isLoading = false
}) => {
  const [filter, setFilter] = useState('all');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <Badge variant="success">Answered</Badge>;
      case 'busy':
      case 'no-answer':
        return <Badge variant="warning">{status === 'busy' ? 'Busy' : 'No Answer'}</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'transferred':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Transferred</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => {
        if (filter === 'transferred') return log.transfer_successful;
        if (filter === 'answered') return log.status === 'answered';
        if (filter === 'failed') return log.status === 'failed';
        return true;
      });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Call Logs</CardTitle>
        <div className="flex space-x-2">
          <div className="flex space-x-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'answered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('answered')}
            >
              Answered
            </Button>
            <Button
              variant={filter === 'transferred' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('transferred')}
            >
              Transferred
            </Button>
            <Button
              variant={filter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('failed')}
            >
              Failed
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {logs.length === 0 ? (
              <p>No call logs available yet.</p>
            ) : (
              <p>No call logs matching the selected filter.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Transferred</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.phone_number}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>{log.duration ? `${log.duration}s` : '-'}</TableCell>
                  <TableCell>
                    {log.transfer_requested ? (
                      log.transfer_successful ? (
                        <Badge variant="success">Successful</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(log.created_at), 'MMM d, h:mm a')}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
