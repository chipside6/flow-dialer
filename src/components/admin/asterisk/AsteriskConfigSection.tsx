
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { FileText, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Info, PhoneIcon } from 'lucide-react';
import { asteriskService } from '@/utils/asteriskService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
          <FileText className="h-5 w-5" />
          Asterisk API Configuration
        </CardTitle>
        <CardDescription>
          Synchronize configuration with your Asterisk server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="bg-slate-50 p-4 rounded-md mb-2">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 mr-2 text-slate-500" />
            <span className="text-sm text-slate-700 font-medium">Sync Process Information</span>
          </div>
          <p className="text-sm text-slate-600">
            This process will sync your GoIP device configuration with the Asterisk server. 
            It generates SIP configuration for all your registered trunks and reloads the Asterisk configuration.
          </p>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 mr-2 text-slate-500" />
              <span className="text-sm text-slate-700 font-medium">Call Transfer Support</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              The sync includes call transfer dialplan logic that allows your campaigns to transfer calls 
              when recipients press 1, using the same GoIP port for both the original and transfer calls.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={isStuck ? handleRetry : handleApiSync} 
          disabled={isLoading && !isStuck}
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
            'Sync Asterisk Configuration'
          )}
        </Button>

        {connectionStatus && (
          <div className={`p-3 rounded-md ${
            connectionStatus.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
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
    </Card>
  );
};
