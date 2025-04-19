import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { FileText, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { asteriskService } from '@/utils/asteriskService';

interface AsteriskConfigSectionProps {
  userId: string;
}

export const AsteriskConfigSection = ({ userId }: AsteriskConfigSectionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleApiSync = async () => {
    setIsLoading(true);
    setConnectionStatus(null);

    try {
      const result = await asteriskService.syncConfiguration(userId, 'sync_user');
      
      setConnectionStatus(result);
      toast({
        title: result.success ? "Sync Successful" : "Sync Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
        <Button 
          onClick={handleApiSync} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing Configuration...
            </>
          ) : (
            'Sync Asterisk Configuration'
          )}
        </Button>

        {connectionStatus && (
          <div className={`p-3 rounded-md ${
            connectionStatus.success 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
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
