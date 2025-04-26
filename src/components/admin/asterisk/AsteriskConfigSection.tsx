
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { FileText, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Info, PhoneIcon, Server } from 'lucide-react';
import { asteriskService } from '@/utils/asteriskService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getConfigFromStorage } from '@/utils/asterisk/config';

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

  // Check if config is valid on mount
  useEffect(() => {
    const config = getConfigFromStorage();
    const isValid = !!(config.apiUrl && config.username && config.password);
    setConfigValid(isValid);
    
    if (!isValid) {
      setSyncError("Asterisk configuration is incomplete. Please configure it in the settings.");
    }
    
    // Also check if VITE_SUPABASE_URL is defined
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setSyncError((prev) => 
        prev ? `${prev} VITE_SUPABASE_URL is not defined.` : "VITE_SUPABASE_URL is not defined."
      );
      setConfigValid(false);
    }
  }, []);

  useEffect(() => {
    // Handle stuck loading state
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
    
    setIsLoading(true);
    setConnectionStatus(null);
    setSyncError(null);
    setIsStuck(false);

    try {
      console.log('Starting Asterisk configuration sync for user:', userId);
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
        {!configValid && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration incomplete</AlertTitle>
            <AlertDescription>
              Please configure your Asterisk server settings in the settings page before syncing.
              {!import.meta.env.VITE_SUPABASE_URL && (
                <p className="mt-2 font-semibold">VITE_SUPABASE_URL environment variable is not set!</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isStuck && (
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Request Taking Longer Than Expected</AlertTitle>
            <AlertDescription>
              The sync request is taking longer than expected. There might be an issue with the server connection.
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
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure Asterisk Settings
        </Button>
      </CardFooter>
    </Card>
  );
};
