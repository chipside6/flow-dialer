
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionTestButton } from './asterisk-connection/ConnectionTestButton';
import { ConnectionResultDisplay } from './asterisk-connection/ConnectionResultDisplay';
import { CorsAlert } from './asterisk-connection/CorsAlert';
import { CurrentConfigDisplay } from './asterisk-connection/CurrentConfigDisplay';
import { TroubleshootingGuide } from './asterisk-connection/TroubleshootingGuide';
import { useAsteriskConfig } from './asterisk-connection/useAsteriskConfig';
import { connectionService } from '@/utils/asterisk/connectionService';

interface AsteriskConnectionTestProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export const AsteriskConnectionTest: React.FC<AsteriskConnectionTestProps> = ({ 
  onConnectionChange 
}) => {
  const { config, isLoading } = useAsteriskConfig();
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showCorsAlert, setShowCorsAlert] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const runConnectionTest = useCallback(async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    setTestResult(null);
    setShowCorsAlert(false);
    
    try {
      const result = await connectionService.testConnection();
      
      console.log("Connection test result:", result);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: "Connected to Asterisk successfully!",
          details: result.message
        });
        onConnectionChange?.(true);
      } else {
        let errorMessage = result.message || "Unknown error occurred";
        let showCors = errorMessage.includes('CORS') || errorMessage.includes('Network Error');
        
        setTestResult({
          success: false,
          message: errorMessage,
          details: result.details || errorMessage
        });
        
        setShowCorsAlert(showCors);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error("Error during connection test:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setTestResult({
        success: false,
        message: `Error: ${errorMessage}`,
        details: "Check the console for more details"
      });
      
      setShowCorsAlert(errorMessage.includes('CORS') || errorMessage.includes('Network Error'));
      onConnectionChange?.(false);
    } finally {
      setIsTesting(false);
    }
  }, [isTesting, onConnectionChange]);

  // Auto-test on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!testResult && !isTesting) {
        runConnectionTest();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [runConnectionTest, testResult, isTesting]);

  return (
    <div className="space-y-4">
      <CurrentConfigDisplay config={config} isLoading={isLoading} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <ConnectionTestButton 
          onClick={runConnectionTest} 
          isTesting={isTesting} 
        />
        
        {testResult && !testResult.success && (
          <Button 
            variant="outline" 
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          >
            {showTroubleshooting ? 'Hide Troubleshooting' : 'Show Troubleshooting'}
          </Button>
        )}
      </div>
      
      {testResult && (
        <ConnectionResultDisplay 
          success={testResult.success} 
          message={testResult.message}
          details={testResult.details}
        />
      )}
      
      {showCorsAlert && <CorsAlert />}
      
      {showTroubleshooting && <TroubleshootingGuide />}
    </div>
  );
};
