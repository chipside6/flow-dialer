
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';

export const GoipHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 goip-header">
      <div>
        <h1 className="text-3xl font-bold">GoIP Setup</h1>
        <p className="text-muted-foreground">Connect your GoIP devices to our Asterisk server</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Badge 
          variant="outline" 
          className="bg-green-100 text-green-800 border-green-300 asterisk-status-badge"
        >
          <Server className="h-4 w-4 mr-1" />
          Asterisk Server: Connected
        </Badge>
      </div>
    </div>
  );
};
