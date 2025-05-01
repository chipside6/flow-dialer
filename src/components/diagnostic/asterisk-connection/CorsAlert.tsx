
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface CorsAlertProps {
  onShowCorsHelp: () => void;
}

export const CorsAlert: React.FC<CorsAlertProps> = ({ onShowCorsHelp }) => {
  return (
    <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-300 mb-4">
      <Info className="h-4 w-4" />
      <AlertTitle>CORS Configuration Required</AlertTitle>
      <AlertDescription>
        You must configure CORS headers on your Asterisk server to allow web connections.
        <Button 
          variant="link" 
          className="p-0 h-auto text-amber-800 underline" 
          onClick={onShowCorsHelp}
        >
          View CORS setup instructions
        </Button>
      </AlertDescription>
    </Alert>
  );
};
