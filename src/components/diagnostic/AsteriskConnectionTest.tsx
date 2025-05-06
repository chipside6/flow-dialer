
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
          details
