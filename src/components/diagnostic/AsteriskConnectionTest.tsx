
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { connectionService } from "@/utils/asterisk/connectionService";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle, RefreshCw, Server, Settings } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getConfigFromStorage, saveConfigToStorage } from "@/utils/asterisk/config";
import { Link } from 'react-router-dom';

export const AsteriskConnectionTest: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  const [currentConfig, setCurrentConfig] = useState(() => {
    const config = getConfigFromStorage();
    // Ensure we're using the known working URL
    if (config.apiUrl !== 'http://10.0.2.15:8088/ari/') {
      config.apiUrl = 'http://10.0.2.15:8088/ari/';
      saveConfigToStorage(config);
    }
    return config;
  });

  // Refresh config when component mounts
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    const config = getConfigFromStorage();
    // Ensure we're using the known working URL
    if (config.apiUrl !== 'http://10.0.2.15:8088/ari/') {
      config.apiUrl = 'http://10.0.2.15:8088/ari/';
      saveConfigToStorage(config);
    }
    setCurrentConfig(config);
    console.log("Loaded Asterisk config:", {
      apiUrl: config.apiUrl,
      username: config.username,
      serverIp: config.serverIp
    });
  };

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

      const result = await connectionService.testConnection();
      setConnectionResult(result);

      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
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

  const handleRefreshConfig = () => {
    loadCurrentConfig();
    toast({
      title: "Configuration Refreshed",
      description: "Asterisk connection details have been refreshed from storage."
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 mb-4">
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <Server className="h-4 w-4 mr-2" />
              Current Asterisk Configuration
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshConfig} 
              title="Refresh configuration"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">API URL:</span> {currentConfig.apiUrl || 'Not set'}</p>
            <p><span className="font-medium">Username:</span> {currentConfig.username || 'Not set'}</p>
            <p><span className="font-medium">Password:</span> {currentConfig.password ? '••••••••' : 'Not set'}</p>
            <p><span className="font-medium">Server IP:</span> {currentConfig.serverIp || 'Not set'}</p>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Using hardcoded URL: http://10.0.2.15:8088/ari/
          </div>
        </div>
      </div>
      
      <Button 
        onClick={testConnection} 
        disabled={isTestingConnection}
        className="w-full"
      >
        {isTestingConnection ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Testing Connection...
          </>
        ) : (
          "Test Asterisk API Connection"
        )}
      </Button>

      {connectionResult && (
        <Alert variant={connectionResult.success ? "default" : "destructive"}>
          {connectionResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {connectionResult.success ? "Connection Successful" : "Connection Failed"}
          </AlertTitle>
          <AlertDescription>
            {connectionResult.message}
          </AlertDescription>
        </Alert>
      )}

      {connectionResult && !connectionResult.success && (
        <div className="mt-2">
          <Link to="/settings">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Configure Asterisk Settings
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
