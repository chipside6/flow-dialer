
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const LoadingDeviceList: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading devices...</span>
      </CardContent>
    </Card>
  );
};
