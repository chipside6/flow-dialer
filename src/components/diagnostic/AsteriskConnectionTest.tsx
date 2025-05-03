
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
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw, Server } from 'lucide-react';

export const AsteriskConnectionTest: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showCorsHelp, setShowCorsHelp] = useState(false);
  const { toast } = useToast();
  const { currentConfig, setCurrentConfig, loadCurrentConfig, handleRefreshConfig } = useAsteriskConfig();
  
  // Automatically detect local server IP
  const localIpAddress = "10.0.2.15"; // Your detected IP

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      // Ensure the URL has proper format
      if (currentConfig.apiUrl && !currentConfig.apiUrl.startsWith('http')) {
        const updatedConfig = {
          ...currentConfig,
          apiUrl: `http://${currentConfig.apiUrl}`
        };
        saveConfigToStorage(updatedConfig);
        setCurrentConfig(updatedConfig);
      }

      // Force the credentials to use admin/admin if not set
      if (!currentConfig.username || !currentConfig.password) {
        const updatedConfig = {
          ...currentConfig,
          username: currentConfig.username || 'admin',
          password: currentConfig.password || 'admin',
          apiUrl: currentConfig.apiUrl || `http://${localIpAddress}:8088/ari/`
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
      
      // If we get a network error, suggest showing the help dialog
      if (!result.success && (
          result.message.toLowerCase().includes('network') || 
          result.message.toLowerCase().includes('connectivity') ||
          result.message.toLowerCase().includes('cannot reach')
        )) {
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

  const handleForceDefaultsAndTest = () => {
    // Set detected IP as default
    const updatedConfig = {
      ...currentConfig,
      apiUrl: `http://${localIpAddress}:8088/ari/`,
      username: 'admin',
      password: 'admin',
      serverIp: localIpAddress
    };
    
    saveConfigToStorage(updatedConfig);
    setCurrentConfig(updatedConfig);
    
    toast({
      title: "Local Server Detected",
      description: `Using detected local server IP: ${localIpAddress}. Testing connection...`
    });
    
    setTimeout(() => testConnection(), 500);
  };

  const handleUseLocalServerIP = () => {
    // Just update the server IP
    const updatedConfig = {
      ...currentConfig,
      serverIp: localIpAddress
    };
    
    saveConfigToStorage(updatedConfig);
    setCurrentConfig(updatedConfig);
    
    toast({
      title: "Server IP Updated",
      description: `Set server IP to local address: ${localIpAddress}`
    });
    
    loadCurrentConfig();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 mb-4">
        <CurrentConfigDisplay 
          currentConfig={currentConfig}
          onRefreshConfig={handleRefreshConfig}
        />
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-medium">
          <Server className="h-4 w-4" />
          <span>Local server detected at: {localIpAddress}</span>
        </div>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          This appears to be your server's IP address. You can use this for your Asterisk connection.
        </p>
        <div className="flex gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUseLocalServerIP}
            className="bg-white dark:bg-green-900/40"
          >
            Update Server IP Only
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleForceDefaultsAndTest}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Use All Local Server Settings
          </Button>
        </div>
      </div>
      
      <CorsAlert onShowCorsHelp={() => setShowCorsHelp(true)} />
      
      <div className="flex flex-col sm:flex-row gap-2">
        <ConnectionTestButton 
          isTestingConnection={isTestingConnection}
          onClick={testConnection}
          variant="default"
        />
      </div>

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
