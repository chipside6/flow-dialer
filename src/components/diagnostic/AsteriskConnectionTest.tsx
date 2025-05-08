
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionTestButton } from './asterisk-connection/ConnectionTestButton';
import { ConnectionResultDisplay } from './asterisk-connection/ConnectionResultDisplay';
import { CorsAlert } from './asterisk-connection/CorsAlert';
import { CurrentConfigDisplay } from './asterisk-connection/CurrentConfigDisplay';
import { TroubleshootingGuide } from './asterisk-connection/TroubleshootingGuide';
import { useAsteriskConfig } from './asterisk-connection/useAsteriskConfig';
import { asteriskService } from '@/utils/asteriskService';

interface AsteriskConnectionTestProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export const AsteriskConnectionTest: React.FC<AsteriskConnectionTestProps> = ({ 
  onConnectionChange 
}) => {
  const { currentConfig, isLoading } = useAsteriskConfig();
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
      console.log("Starting connection test using edge function...");
      const result = await asteriskService.testAsteriskConnection();
      
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
    runConnectionTest();
  }, []);

  const handleShowTroubleshooting = () => {
    setShowTroubleshooting(true);
  };

  return (
    <div className="space-y-4">
      <CurrentConfigDisplay 
        config={currentConfig}
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
          onShowCorsHelp={handleShowTroubleshooting}
        />
      )}
      
      {showTroubleshooting && (
        <TroubleshootingGuide
          onShowCorsHelp={handleShowTroubleshooting}
        />
      )}
    </div>
  );
};
