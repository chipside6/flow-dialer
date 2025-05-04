
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { FileText, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Info, PhoneIcon, Server, Settings, Terminal } from 'lucide-react';
import { asteriskService } from '@/utils/asteriskService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getConfigFromStorage } from '@/utils/asterisk/config';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface AsteriskConfigSectionProps {
  userId: string;
}

export const AsteriskConfigSection = ({ userId }: AsteriskConfigSectionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [configValid, setConfigValid] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState(() => getConfigFromStorage());
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Check if config is valid and get Supabase URL on mount
  useEffect(() => {
    const config = getConfigFromStorage();
    setCurrentConfig(config);
    const isValid = !!(config.apiUrl && config.username && config.password);
    setConfigValid(isValid);
    
    if (!isValid) {
      setSyncError("Asterisk configuration is incomplete. Please configure it in the settings.");
    }
    
    // Get Supabase URL from the utility function
    if (!supabaseUrl) {
      try {
        const url = getSupabaseUrl();
        setSupabaseUrl(url);
        
        if (!url) {
          setSyncError((prev) => 
            prev ? `${prev} Supabase URL is not available.` : "Supabase URL is not available."
          );
          setConfigValid(false);
        }
      } catch (error) {
        console.error("Error getting Supabase URL:", error);
        setSyncError((prev) =>
          prev ? `${prev} Error accessing Supabase configuration.` : "Error accessing Supabase configuration."
        );
        setConfigValid(false);
      }
    }
  }, [supabaseUrl]);

  // Handle stuck loading state
  useEffect(() => {
    let stuckTimer: NodeJS.Timeout;
    
    if (isLoading) {
      stuckTimer = setTimeout(() => {
        setIsStuck(true);
      }, 10000); // Consider it stuck after 10 seconds
    } else {
      setIsStuck(false);
    }
    
    return () => {
      if (stuckTimer) clearTimeout(stuckTimer);
    };
  }, [isLoading]);

  const handleApiSync = async () => {
    if (!configValid) {
      toast({
        title: "Configuration incomplete",
        description: "Please configure Asterisk settings before syncing",
        variant: "destructive"
      });
      return;
    }
    
    if (!supabaseUrl) {
      toast({
        title: "Missing Supabase URL",
        description: "Cannot connect to Supabase functions. Please reload the page or contact support.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setConnectionStatus(null);
    setSyncError(null);
    setIsStuck(false);

    try {
      console.log('Starting Asterisk configuration sync for user:', userId);
      
      // First, check if we can connect to Asterisk
      const checkResponse = await fetch(`${supabaseUrl}/functions/v1/check-asterisk-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          serverIp: currentConfig.serverIp || '10.0.2.15'
        })
      });
      
      if (!checkResponse.ok) {
        throw new Error(`Asterisk connection check failed: ${checkResponse.statusText}`);
      }
      
      const checkResult = await checkResponse.json();
      console.log('Asterisk connection check result:', checkResult);
      
      if (!checkResult.success) {
        setSyncError(`Cannot connect to Asterisk server: ${checkResult.message}`);
        setConnectionStatus({
          success: false,
          message: checkResult.message
        });
        toast({
          title: "Connection Failed",
          description: checkResult.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Now perform the sync operation
      const result = await asteriskService.syncConfiguration(userId, 'sync_user');
      console.log('Sync result:', result);
      
      setConnectionStatus(result);
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message,
          variant: "default"
        });
      } else {
        setSyncError(result.message);
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in handleApiSync:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      setConnectionStatus({
        success: false,
        message: errorMessage
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsStuck(false);
    handleApiSync();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Asterisk API Configuration
        </CardTitle>
        <CardDescription>
          Synchronize configuration with your Asterisk server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Configuration Display */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Server className="h-4 w-4 mr-2" />
            Current Asterisk Configuration
          </h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">API URL:</span> {currentConfig.apiUrl || 'Not set'}</p>
            <p><span className="font-medium">Username:</span> {currentConfig.username || 'Not set'}</p>
            <p><span className="font-medium">Password:</span> {currentConfig.password ? '••••••••' : 'Not set'}</p>
            <p><span className="font-medium">Server IP:</span> {currentConfig.serverIp || '10.0.2.15'} {currentConfig.serverIp === '10.0.2.15' && '(Local Server)'}</p>
          </div>
          <div className="mt-3 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Terminal className="mr-1 h-4 w-4" />
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </Button>
          </div>
          
          {showDebugInfo && (
            <div className="mt-3 bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono overflow-x-auto">
              <pre>
                {JSON.stringify({
                  config: {
                    ...currentConfig,
                    password: currentConfig.password ? '[REDACTED]' : null
                  },
                  supabaseUrl: supabaseUrl,
                  configValid,
                  localIp: '10.0.2.15',
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {!configValid && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration incomplete</AlertTitle>
            <AlertDescription>
              Please configure your Asterisk server settings in the settings page before syncing.
              {!supabaseUrl && (
                <p className="mt-2 font-semibold">Supabase URL is not available! This is needed to connect to edge functions.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isStuck && (
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Request Taking Longer Than Expected</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The sync request is taking longer than expected. There might be an issue with the server connection.</p>
              <p className="text-sm font-medium">Common causes:</p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                <li>Asterisk server is not running</li>
                <li>Firewall is blocking the connection</li>
                <li>Network connectivity issues between Supabase and Asterisk</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {syncError && !isLoading && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error syncing configuration:</AlertTitle>
            <AlertDescription>
              {syncError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md mb-2">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 mr-2 text-slate-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Sync Process Information</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This process will sync your GoIP device configuration with the Asterisk server. 
            It generates SIP configuration for all your registered trunks and reloads the Asterisk configuration.
          </p>
          <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 mr-2 text-slate-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Call Transfer Support</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              The sync includes call transfer dialplan logic that allows your campaigns to transfer calls 
              when recipients press 1, using the same GoIP port for both the original and transfer calls.
              You can select from your saved transfer numbers when setting up campaigns.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={isStuck ? handleRetry : handleApiSync} 
          disabled={(isLoading && !isStuck) || !configValid}
          className="w-full"
        >
          {isLoading && !isStuck ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing Configuration...
            </>
          ) : isStuck ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
              Retry Sync (Taking Longer Than Expected)
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Asterisk Configuration
            </>
          )}
        </Button>

        {connectionStatus && (
          <div className={`p-3 rounded-md ${
            connectionStatus.success 
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
          }`}>
            {connectionStatus.success ? (
              <CheckCircle className="inline mr-2 h-4 w-4" />
            ) : (
              <AlertCircle className="inline mr-2 h-4 w-4" />
            )}
            {connectionStatus.message}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Force using local server settings
            const updatedConfig = {
              apiUrl: `http://10.0.2.15:8088/ari/`,
              username: 'admin',
              password: 'admin',
              serverIp: '10.0.2.15'
            };
            localStorage.setItem('asterisk_config', JSON.stringify(updatedConfig));
            setCurrentConfig(updatedConfig);
            toast({
              title: "Local Server Settings Applied",
              description: "Using default settings for local server (10.0.2.15)"
            });
            setTimeout(() => window.location.reload(), 1000);
          }}
        >
          <Server className="mr-2 h-4 w-4" />
          Use Local Server (10.0.2.15)
        </Button>
        
        <Link to="/settings">
          <Button 
            variant="outline"
            size="sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure Asterisk Settings
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
