
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  retestConnection: () => void;
  reloadPjsip: () => void;
  reloadExtensions: () => void;
  saveEnvironmentVariables: () => void;
  isReloading: { pjsip: boolean; extensions: boolean };
  isConnected: boolean;
  isHostedEnvironment: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  retestConnection,
  reloadPjsip,
  reloadExtensions,
  saveEnvironmentVariables,
  isReloading,
  isConnected,
  isHostedEnvironment
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 pt-4">
      <Button 
        variant="outline"
        onClick={retestConnection}
        disabled={isReloading.pjsip || isReloading.extensions}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4`} />
        Test Connection
      </Button>
      
      <Button 
        variant="outline"
        onClick={reloadPjsip}
        disabled={isReloading.pjsip || (!isConnected && !isHostedEnvironment)}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isReloading.pjsip ? 'animate-spin' : ''}`} />
        Reload PJSIP
      </Button>
      
      <Button 
        variant="outline"
        onClick={reloadExtensions}
        disabled={isReloading.extensions || (!isConnected && !isHostedEnvironment)}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isReloading.extensions ? 'animate-spin' : ''}`} />
        Reload Extensions
      </Button>
      
      <div className="flex-grow"></div>
      
      <Button 
        size="lg" 
        onClick={saveEnvironmentVariables}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Save All Configuration
      </Button>
    </div>
  );
};

export default ActionButtons;
