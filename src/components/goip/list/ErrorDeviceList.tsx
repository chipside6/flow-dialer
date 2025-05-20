
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ErrorDeviceListProps {
  error: Error | null;
  onRetry: () => void;
}

export const ErrorDeviceList: React.FC<ErrorDeviceListProps> = ({ error, onRetry }) => {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Error Loading Devices</CardTitle>
        <CardDescription>
          {error instanceof Error ? error.message : "Failed to load devices"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};
