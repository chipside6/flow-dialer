
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
            Network Connectivity Issues?
          </AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>
              If you encounter network errors connecting to your Asterisk server, it 
              may be due to CORS restrictions or network connectivity issues.
            </p>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowCorsHelp}
                className="flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Troubleshooting Help
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
