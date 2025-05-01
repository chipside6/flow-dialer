
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

interface TroubleshootingGuideProps {
  onShowCorsHelp: () => void;
}

export const TroubleshootingGuide: React.FC<TroubleshootingGuideProps> = ({
  onShowCorsHelp
}) => {
  return (
    <>
      <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Troubleshooting Steps</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>1. Ensure your Asterisk server is running and accessible at 10.0.2.15:8088.</p>
          <p>2. Check that the correct username and password are set (default: admin/admin).</p>
          <p>3. <strong>Verify that CORS is properly configured on your Asterisk server.</strong></p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShowCorsHelp}
            className="mt-2"
          >
            <Code className="mr-2 h-4 w-4" />
            View CORS Configuration Help
          </Button>
        </AlertDescription>
      </Alert>
      
      <div className="mt-2">
        <Link to="/settings">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Configure Asterisk Settings
          </Button>
        </Link>
      </div>
    </>
  );
};
