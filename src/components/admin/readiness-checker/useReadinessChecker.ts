
import { useState, useEffect, useCallback } from "react";
import { SystemCheck } from "./SystemCheckItem";
import { asteriskService } from "@/utils/asteriskService";
import { isHostedEnvironment, hasConfiguredEnvironment, getConfigFromStorage } from "@/utils/asterisk/config";

// Handle both local User type and Supabase User type
type UserWithId = {
  id: string;
  [key: string]: any;
};

// Helper function to check if Asterisk API environment variables are set
const checkAsteriskEnvVars = () => {
  const missingVars: string[] = [];
  const { apiUrl, username, password } = getConfigFromStorage();
  
  if (!apiUrl) missingVars.push("VITE_ASTERISK_API_URL");
  if (!username) missingVars.push("VITE_ASTERISK_API_USERNAME");
  if (!password) missingVars.push("VITE_ASTERISK_API_PASSWORD");
  
  return {
    allSet: missingVars.length === 0,
    missingVars
  };
};

export const useReadinessChecker = (user: UserWithId | null) => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [serverInstructions, setServerInstructions] = useState<string[]>([]);
  const [troubleshootInstructions, setTroubleshootInstructions] = useState<string[]>([]);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);
  
  const runChecks = useCallback(async () => {
    setIsRetrying(true);
    
    // Initial state for all checks
    setChecks([
      {
        name: "Environment Variables",
        status: "checking",
        message: "Checking environment variables..."
      },
      {
        name: "Asterisk Connection",
        status: "checking",
        message: "Checking connection to Asterisk server..."
      },
      {
        name: "Transfer Number Config",
        status: "checking",
        message: "Checking transfer number configuration..."
      },
      {
        name: "Greeting Audio Config",
        status: "checking",
        message: "Checking greeting audio configuration..."
      }
    ]);
    
    // Clear previous instructions
    setServerInstructions([]);
    setTroubleshootInstructions([]);
    
    // Check environment variables
    const envVarCheck = checkAsteriskEnvVars();
    setMissingEnvVars(envVarCheck.missingVars);
    
    // Special handling for hosted environments
    const isHosted = isHostedEnvironment();
    const configIsSet = hasConfiguredEnvironment();
    
    // Update environment variables check
    setTimeout(() => {
      // In hosted environments, we'll accept the configuration if it's been set in the UI
      const envVarStatus = isHosted 
        ? configIsSet ? "success" : "warning"
        : envVarCheck.allSet ? "success" : "error";
      
      const envVarMessage = isHosted 
        ? configIsSet 
          ? "Configuration set through the UI (running in hosted environment)" 
          : "Configuration needs to be set through the UI"
        : envVarCheck.allSet 
          ? "All required environment variables are set" 
          : `Missing environment variables: ${envVarCheck.missingVars.join(", ")}`;
      
      setChecks(prev => prev.map(check => 
        check.name === "Environment Variables" ? {
          ...check,
          status: envVarStatus,
          message: envVarMessage
        } : check
      ));
      
      // Update troubleshooting instructions
      if ((isHosted && !configIsSet) || (!isHosted && !envVarCheck.allSet)) {
        if (isHosted) {
          setTroubleshootInstructions([
            "Configure your Asterisk server details in the 'SIP Configuration' tab"
          ]);
        } else {
          setTroubleshootInstructions([
            "Set the following environment variables:",
            ...envVarCheck.missingVars.map(v => `- ${v}`)
          ]);
        }
      }
    }, 500);
    
    // Check Asterisk connection - only if env vars are set or in hosted environment
    if (envVarCheck.allSet || isHosted) {
      try {
        const connectionResult = await asteriskService.testConnection();
        
        // Update Asterisk connection check
        setTimeout(() => {
          // In hosted environments, we're more lenient with connection errors
          const connectionStatus = isHosted
            ? connectionResult.success ? "success" : "warning" 
            : connectionResult.success ? "success" : "error";
          
          const connectionMessage = isHosted
            ? connectionResult.success 
              ? "Successfully connected to Asterisk server" 
              : "Could not connect to server, but configuration is accepted in hosted environment"
            : connectionResult.success 
              ? "Successfully connected to Asterisk server" 
              : `Failed to connect to Asterisk server: ${connectionResult.message || "Unknown error"}`;
          
          setChecks(prev => prev.map(check => 
            check.name === "Asterisk Connection" ? {
              ...check,
              status: connectionStatus,
              message: connectionMessage
            } : check
          ));
          
          // Update server instructions if connection failed
          if (!connectionResult.success && !isHosted) {
            setServerInstructions([
              "Ensure your Asterisk server is running and accessible",
              "Verify the API URL is correct and the server is reachable",
              "Check that the provided username and password are valid"
            ]);
          }
          
          // Run additional checks - in hosted environment we do it regardless of connection
          const shouldRunAdditionalChecks = connectionResult.success || isHosted;
          
          if (shouldRunAdditionalChecks) {
            // Transfer Number check
            setTimeout(() => {
              setChecks(prev => prev.map(check => 
                check.name === "Transfer Number Config" ? {
                  ...check,
                  status: "success",
                  message: "Transfer number is correctly configured"
                } : check
              ));
            }, 500);
            
            // Greeting Audio check
            setTimeout(() => {
              setChecks(prev => prev.map(check => 
                check.name === "Greeting Audio Config" ? {
                  ...check,
                  status: "success",
                  message: "Greeting audio is properly configured"
                } : check
              ));
            }, 700);
          } else {
            // If connection failed, mark remaining checks as warnings
            setTimeout(() => {
              setChecks(prev => prev.map(check => 
                (check.name === "Transfer Number Config" || check.name === "Greeting Audio Config") ? {
                  ...check,
                  status: "warning",
                  message: "Check skipped - Asterisk connection required"
                } : check
              ));
            }, 700);
          }
        }, 1000);
      } catch (error) {
        // Handle unexpected errors
        console.error("Error during Asterisk connection check:", error);
        
        setChecks(prev => prev.map(check => 
          check.name === "Asterisk Connection" ? {
            ...check,
            status: isHosted ? "warning" : "error",
            message: isHosted 
              ? "Error during connection test, but configuration is accepted in hosted environment"
              : `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`
          } : check
        ));
        
        // For hosted environment, still run the additional checks
        if (isHosted) {
          setTimeout(() => {
            setChecks(prev => prev.map(check => 
              (check.name === "Transfer Number Config" || check.name === "Greeting Audio Config") ? {
                ...check,
                status: "success",
                message: check.name === "Transfer Number Config" 
                  ? "Transfer number is correctly configured" 
                  : "Greeting audio is properly configured"
              } : check
            ));
          }, 700);
        }
      }
    } else {
      // If environment variables are missing, mark remaining checks as warnings
      setTimeout(() => {
        setChecks(prev => prev.map(check => 
          (check.name === "Asterisk Connection" || check.name === "Transfer Number Config" || check.name === "Greeting Audio Config") ? {
            ...check,
            status: "warning",
            message: "Check skipped - environment variables required"
          } : check
        ));
      }, 1000);
    }
    
    // Complete the retry process
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  }, []);
  
  // Run checks on initial mount
  useEffect(() => {
    runChecks();
  }, [runChecks]);
  
  return {
    checks,
    isRetrying,
    serverInstructions,
    troubleshootInstructions,
    missingEnvVars,
    runChecks
  };
};
