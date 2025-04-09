
import React from 'react';
import { Server, Router, PhoneCall } from 'lucide-react';

export const GoipHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-2">
        <Server className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">GoIP Device Setup</h1>
      </div>
      <p className="text-muted-foreground">
        Connect your GoIP device to our Asterisk server to make automated calls with your campaigns.
        Follow the steps below to generate SIP credentials and configure your device.
      </p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Step 1: Generate Credentials</h3>
            <p className="text-sm text-muted-foreground">
              Create SIP credentials to authenticate your GoIP device with our server.
            </p>
          </div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Router className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Step 2: Configure Device</h3>
            <p className="text-sm text-muted-foreground">
              Enter the SIP details in your GoIP device's configuration panel.
            </p>
          </div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <PhoneCall className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Step 3: Start Making Calls</h3>
            <p className="text-sm text-muted-foreground">
              Once connected, you can use your GoIP device with any campaign.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
