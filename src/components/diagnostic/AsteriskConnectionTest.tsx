
import React, { useState } from 'react';
import { connectionService } from "@/utils/asterisk/connectionService";
import { useToast } from "@/components/ui/use-toast";
import { saveConfigToStorage } from "@/utils/asterisk/config";

import { CurrentConfigDisplay } from "./asterisk-connection/CurrentConfigDisplay";
import { ConnectionTestButton } from "./asterisk-connection/ConnectionTestButton";
import { ConnectionResultDisplay } from "./asterisk-connection/ConnectionResultDisplay";
import { CorsAlert } from "./asterisk-connection/CorsAlert";
import { CorsInstructionsDialog } from "./asterisk-connection/CorsInstructionsDialog";
import { TroubleshootingGuide } from "./asterisk-connection/TroubleshootingGuide";
import { useAsteriskConfig } from "./asterisk-connection/useAsteriskConfig";

export const AsteriskConnectionTest: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showCorsHelp, setShowCorsHelp] = useState(false);
  const { toast } = useToast();
  const { currentConfig, setCurrentConfig, loadCurrentConfig, handleRefreshConfig } = useAsteriskConfig();

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      // Force the credentials to use admin/admin if not set
      if (!currentConfig.username || !currentConfig.password) {
        const updatedConfig = {
          ...currentConfig,
          username: currentConfig.username || 'admin',
          password: currentConfig.password || 'admin',
          apiUrl: 'http://10.0.2.15:8088/ari/'
        };
        saveConfigToStorage(updatedConfig);
        setCurrentConfig(updatedConfig);
      }

      toast({
        title: "Testing Connection",
        description: "Attempting to connect to Asterisk server...",
      });

      const result = await connectionService.testConnection();
      setConnectionResult(result);

      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // If we get a CORS error, suggest showing the help dialog
      if (!result.success && result.message.toLowerCase().includes('cors')) {
        setTimeout(() => setShowCorsHelp(true), 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Error Testing Connection",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
      // Refresh the config after testing
      loadCurrentConfig();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 mb-4">
        <CurrentConfigDisplay 
          currentConfig={currentConfig}
          onRefreshConfig={handleRefreshConfig}
        />
      </div>
      
      <CorsAlert onShowCorsHelp={() => setShowCorsHelp(true)} />
      
      <ConnectionTestButton 
        isTestingConnection={isTestingConnection}
        onClick={testConnection}
      />

      <ConnectionResultDisplay result={connectionResult} />

      {connectionResult && !connectionResult.success && (
        <TroubleshootingGuide onShowCorsHelp={() => setShowCorsHelp(true)} />
      )}
      
      <CorsInstructionsDialog
        open={showCorsHelp} 
        onOpenChange={setShowCorsHelp}
      />
    </div>
  );
};
