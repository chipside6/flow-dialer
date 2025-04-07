
import React from 'react';
import { Smartphone } from 'lucide-react';

export const EmptyCredentialsState = () => {
  return (
    <div className="text-center py-8 border border-dashed rounded-md mt-6">
      <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-2">No SIP credentials configured</p>
      <p className="text-xs text-muted-foreground mb-4">Generate SIP credentials to connect your GoIP device to our Asterisk server</p>
    </div>
  );
};
