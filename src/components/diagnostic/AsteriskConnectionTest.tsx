
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
import { CorsInstructionsDialog } from './asterisk-connection/CorsInstructionsDialog';

interface AsteriskConnectionTestProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export const AsteriskConnectionTest: React.FC<AsteriskConnectionTestProps> = ({ 
  onConnectionChange 
}) => {
  const { currentConfig, isLoading, handleRefreshConfig } = useAsteriskConfig();
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showCorsAlert, setShowCorsAlert] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showCorsDialog, setShowCorsDialog] = useState(false);

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
          details: result.details || "Connection successful"
        });
        
        if (onConnectionChange) {
          onConnectionChange(true);
        }
      } else {
        setTestResult({
          success: false,
          message: result.message || "Connection failed",
          details: result.details
        });
        
        // If there's a CORS error, show the CORS alert
        if (result.message && (
          result.message.includes("CORS") || 
          result.message.includes("NetworkError") ||
          result.message.includes("Failed to fetch")
        )) {
          setShowCorsAlert(true);
        }
        
        if (onConnectionChange) {
          onConnectionChange(false);
        }
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      
      setTestResult({
        success: false,
        message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: "An unexpected error occurred while testing the connection"
      });
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } finally {
      setIsTesting(false);
    }
  }, [isTesting, onConnectionChange]);

  // Run connection test on component mount
  useEffect(() => {
    // Commenting out the auto-run test on mount as it might be intrusive
    // runConnectionTest();
  }, []);

  const handleShowTroubleshooting = () => {
    setShowTroubleshooting(true);
  };

  const handleShowCorsHelp = () => {
    setShowCorsDialog(true);
  };

  return (
    <div className="space-y-4">
      <CurrentConfigDisplay 
        config={currentConfig}
        onRefreshConfig={handleRefreshConfig}
      />
      
      <ConnectionTestButton
        onClick={runConnectionTest}
        isTesting={isTesting}
      />
      
      {testResult && (
        <ConnectionResultDisplay
          result={testResult}
        />
      )}
      
      {showCorsAlert && (
        <CorsAlert 
          onShowCorsHelp={handleShowCorsHelp}
        />
      )}
      
      {showTroubleshooting && (
        <TroubleshootingGuide
          onShowCorsHelp={handleShowCorsHelp}
        />
      )}

      <CorsInstructionsDialog 
        open={showCorsDialog} 
        onOpenChange={setShowCorsDialog} 
      />
    </div>
  );
};
