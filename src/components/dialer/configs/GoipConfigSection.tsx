import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { useConfigActions } from '@/hooks/useConfigActions';

interface GoipConfigSectionProps {
  goipConfig: string;
}

export const GoipConfigSection = ({ goipConfig }: GoipConfigSectionProps) => {
  const { copied, handleCopy } = useConfigActions();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure your GoIP device with these settings:
      </p>
      <div className="relative">
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted">
          <pre className="text-xs">{goipConfig}</pre>
        </ScrollArea>
        <div className="absolute top-2 right-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => handleCopy(goipConfig)}
          >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-4">
        <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
          GoIP Device Setup Instructions
        </h4>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-4">
          <li>Access your GoIP device's web interface (typically by typing its IP address in a browser)</li>
          <li>Go to the "Configuration" or "SIP Settings" section</li>
          <li>Enter the settings above - make sure to use the correct SIP user and password</li>
          <li>Save the configuration and restart the device if required</li>
          <li>Check the registration status to ensure it's connected to your Asterisk server</li>
        </ul>
      </div>
    </div>
  );
};
