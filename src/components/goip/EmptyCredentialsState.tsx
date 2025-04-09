
import React from 'react';
import { ServerOff } from 'lucide-react';

export const EmptyCredentialsState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/30">
      <ServerOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No SIP Credentials</h3>
      <p className="text-muted-foreground max-w-sm mt-2">
        You haven't generated any SIP credentials yet. Generate credentials to connect your GoIP device to our system.
      </p>
    </div>
  );
};
