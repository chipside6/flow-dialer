
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CallLog } from '@/hooks/useCallLogs';
import { formatPhoneNumber, formatDateTime } from '@/utils/formatters';

interface CallLogsTableProps {
  logs: CallLog[];
  onRefresh: () => void;
}

export const CallLogsTable: React.FC<CallLogsTableProps> = ({ logs, onRefresh }) => {
  // Helper to get badge variant based on call status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'human':
        return <Badge variant="success">{status}</Badge>;
      case 'voicemail':
        return <Badge variant="secondary">{status}</Badge>;
      case 'failed':
      case 'error':
      case 'busy':
      case 'noanswer':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Call Logs</CardTitle>
            <CardDescription>History of all calls made for this campaign</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Phone className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No call logs yet</p>
            <p className="text-sm text-muted-foreground">
              Logs will appear here once calls are made for this campaign
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Transfer</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatPhoneNumber(log.phone_number)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{log.duration}s</TableCell>
                    <TableCell>
                      {log.transfer_requested ? (
                        log.transfer_successful ? (
                          <span className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" />
                            Transferred
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-600">
                            <X className="h-4 w-4 mr-1" />
                            Failed
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
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
