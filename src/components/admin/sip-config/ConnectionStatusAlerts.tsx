
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface ConnectionStatusAlertsProps {
  isEnvironmentSaved: boolean;
  connectionTested: boolean;
  isConnected: boolean;
  isHostedEnvironment: boolean;
}

const ConnectionStatusAlerts: React.FC<ConnectionStatusAlertsProps> = ({
  isEnvironmentSaved,
  connectionTested,
  isConnected,
  isHostedEnvironment
}) => {
  return (
    <>
      {isEnvironmentSaved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Configuration Saved</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Asterisk configuration is complete and saved. You're ready to launch your campaigns!
          </AlertDescription>
        </Alert>
      )}
      
      {connectionTested && !isConnected && isHostedEnvironment && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Hosted Environment</AlertTitle>
          <AlertDescription className="text-blue-700">
            You're running in a Lovable hosted environment. Your configuration will be saved and used when your Asterisk server becomes reachable.
          </AlertDescription>
        </Alert>
      )}
      
      {connectionTested && !isConnected && !isHostedEnvironment && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Connection Issue</AlertTitle>
          <AlertDescription className="text-amber-700">
            Unable to connect to your Asterisk server. This could be because the server is not running,
            or because there's a network issue. You can still configure your settings and save them.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ConnectionStatusAlerts;
