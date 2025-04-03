
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  isHostedEnvironment,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-end">
      {!isHostedEnvironment && (
        <Button
          variant="outline"
          onClick={retestConnection}
          disabled={isReloading.pjsip || isReloading.extensions}
        >
          Test Connection
        </Button>
      )}

      <Button
        variant="outline"
        onClick={reloadPjsip}
        disabled={isReloading.pjsip || isReloading.extensions || !isConnected}
      >
        {isReloading.pjsip ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reloading PJSIP...
          </>
        ) : (
          "Reload PJSIP"
        )}
      </Button>

      <Button
        variant="outline"
        onClick={reloadExtensions}
        disabled={isReloading.pjsip || isReloading.extensions || !isConnected}
      >
        {isReloading.extensions ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reloading Extensions...
          </>
        ) : (
          "Reload Extensions"
        )}
      </Button>

      <Button
        variant="default"
        onClick={saveEnvironmentVariables}
        disabled={isReloading.pjsip || isReloading.extensions}
      >
        Save Configuration
      </Button>
    </div>
  );
};

export default ActionButtons;
