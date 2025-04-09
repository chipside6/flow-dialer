
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PhoneCall, Clock, Check, X, RefreshCw, FileText, Search, Download } from 'lucide-react';
import { CallLog } from '@/hooks/useCallLogs';
import { format } from 'date-fns';

interface CallLogsTableProps {
  logs: CallLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const CallLogsTable: React.FC<CallLogsTableProps> = ({
  logs,
  isLoading = false,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.phone_number.includes(searchTerm) || 
    log.status.includes(searchTerm.toLowerCase()) ||
    (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Get status badge variant based on call status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'human':
        return <Badge variant="success">Human</Badge>;
      case 'voicemail':
        return <Badge variant="warning">Voicemail</Badge>;
      case 'busy':
        return <Badge variant="secondary">Busy</Badge>;
      case 'noanswer':
        return <Badge variant="secondary">No Answer</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };
  
  // Export logs to CSV
  const exportToCSV = () => {
    if (logs.length === 0) return;
    
    // Create CSV content
    const headers = ['Phone Number', 'Status', 'Duration', 'Transfer Requested', 'Transfer Successful', 'Date', 'Notes'];
    const rows = logs.map(log => [
      log.phone_number,
      log.status,
      log.duration ? `${log.duration}s` : 'N/A',
      log.transfer_requested ? 'Yes' : 'No',
      log.transfer_successful ? 'Yes' : 'No',
      formatDate(log.created_at),
      log.notes?.replace(/,/g, ';') || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `call_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Call Logs
            </CardTitle>
            <CardDescription>
              History of calls made by the autodialer
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search phone numbers or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredLogs.length > 0 ? (
          <ScrollArea className="h-[400px] rounded-md border">
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
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.phone_number}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.duration ? `${log.duration}s` : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.transfer_requested ? (
                        <div className="flex items-center gap-1">
                          {log.transfer_successful ? (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-xs">Successful</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-amber-500" />
                              <span className="text-xs">Requested</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No call logs available</p>
            ) : (
              <p className="text-muted-foreground">No results matching your search</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
