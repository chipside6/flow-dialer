
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, HelpCircle, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CorsAlertProps {
  onShowCorsHelp: () => void;
}

export const CorsAlert: React.FC<CorsAlertProps> = ({ onShowCorsHelp }) => {
  return (
    <Alert variant="warning" className="mb-4">
      <div className="flex items-start">
        <Network className="h-4 w-4 mt-0.5 mr-2" />
        <div className="flex-1">
          <AlertTitle className="font-medium">
            GoIP-Asterisk Connection Setup
          </AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>
              Follow this workflow to integrate your GoIP device with Asterisk:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Configure your Asterisk server with proper SIP settings</li>
              <li>Add the GoIP device credentials to your Asterisk configuration</li>
              <li>Set up the GoIP device to connect to your Asterisk server</li>
              <li>Test the connection through both devices</li>
              <li>Configure campaign dialplans to use the GoIP ports</li>
            </ol>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowCorsHelp}
                className="flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Detailed Setup Instructions
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
