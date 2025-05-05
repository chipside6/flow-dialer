
import React, { useState } from 'react';
import { connectionService } from "@/utils/asterisk/connectionService";
import { useToast } from "@/components/ui/use-toast";
import { saveConfigToStorage, getConfigFromStorage } from "@/utils/asterisk/config";

import { CurrentConfigDisplay } from "./asterisk-connection/CurrentConfigDisplay";
import { ConnectionTestButton } from "./asterisk-connection/ConnectionTestButton";
import { ConnectionResultDisplay } from "./asterisk-connection/ConnectionResultDisplay";
import { useAsteriskConfig } from "./asterisk-connection/useAsteriskConfig";
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw, Server } from 'lucide-react';

export const AsteriskConnectionTest: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  const { currentConfig, setCurrentConfig, loadCurrentConfig, handleRefreshConfig } = useAsteriskConfig();
  
  // Use the specified server IP
  const localIpAddress = "192.168.0.197";

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

      console.log("Starting Asterisk connection test with config:", {
        apiUrl: currentConfig.apiUrl,
        username: currentConfig.username,
        serverIp: currentConfig.serverIp || 'not set'
      });

      const result = await connectionService.testConnection();
      setConnectionResult(result);
      console.log("Connection test result:", result);

      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Connection test error:", error);
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 mb-4">
        <CurrentConfigDisplay 
          currentConfig={currentConfig}
          onRefreshConfig={handleRefreshConfig}
        />
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md mb-6">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-medium">
          <Server className="h-5 w-5" />
          <span>Local server configured at: {localIpAddress}</span>
        </div>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          This appears to be your server's IP address. Click the button below to use this configuration.
        </p>
        <div className="flex gap-2 mt-3">
          <Button 
            variant="default" 
            size="lg" 
            onClick={handleForceDefaultsAndTest}
            className="bg-green-600 hover:bg-green-700 text-white w-full py-6 text-lg"
          >
            <Server className="mr-2 h-5 w-5" />
            Use Local Server (192.168.0.197) & Test Connection
          </Button>
        </div>
      </div>
      
      <ConnectionTestButton 
        isTestingConnection={isTestingConnection}
        onClick={testConnection}
        variant="default"
      />

      <ConnectionResultDisplay result={connectionResult} />
    </div>
  );
};
