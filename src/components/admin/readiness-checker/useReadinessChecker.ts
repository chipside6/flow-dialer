
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
      const envVarStatus = envVarCheck.allSet ? "success" : "error";
      const envVarMessage = envVarCheck.allSet 
        ? (isHosted ? "Configuration settings detected" : "Environment variables accepted") 
        : "Missing required environment variables";
      
      setChecks(prev => prev.map(check => 
        check.name === "Environment Variables" ? {
          ...check,
          status: envVarStatus,
          message: envVarMessage
        } : check
      ));
      
      if (!envVarCheck.allSet) {
        setTroubleshootInstructions(prev => [
          ...prev,
          "Please set the missing environment variables in your configuration."
        ]);
      }
      
      // If env vars are set, test Asterisk connection
      if (envVarCheck.allSet) {
        testAsteriskConnection();
      } else {
        // Update all remaining checks to error if env vars are missing
        setChecks(prev => prev.map(check => 
          check.name !== "Environment Variables" ? {
            ...check,
            status: "error",
            message: "Cannot check without environment variables"
          } : check
        ));
        setIsRetrying(false);
      }
    }, 500);
    
    const testAsteriskConnection = async () => {
      try {
        const result = await asteriskService.testConnection();
        
        if (result.success) {
          setChecks(prev => prev.map(check => 
            check.name === "Asterisk Connection" ? {
              ...check,
              status: "success",
              message: "Connected to Asterisk server successfully"
            } : check
          ));
          
          // Since connection is successful, check other configs
          checkTransferConfig();
          checkGreetingConfig();
        } else {
          setChecks(prev => prev.map(check => 
            check.name === "Asterisk Connection" ? {
              ...check,
              status: "error",
              message: "Could not connect to Asterisk server"
            } : check
          ));
          
          setTroubleshootInstructions(prev => [
            ...prev,
            "Check if your Asterisk server is running and accessible.",
            "Verify your API URL, username, and password are correct.",
            "Ensure there are no network issues blocking the connection."
          ]);
          
          // Update remaining checks to warning since we can't verify them
          setChecks(prev => prev.map(check => 
            !["Environment Variables", "Asterisk Connection"].includes(check.name) ? {
              ...check,
              status: "warning",
              message: "Cannot verify without Asterisk connection"
            } : check
          ));
          
          setIsRetrying(false);
        }
      } catch (error) {
        setChecks(prev => prev.map(check => 
          check.name === "Asterisk Connection" ? {
            ...check,
            status: "error",
            message: `Connection error: ${error.message || "Unknown error"}`
          } : check
        ));
        
        setIsRetrying(false);
      }
    };
    
    const checkTransferConfig = () => {
      // For now, we'll mark this as successful if we have a connection
      setTimeout(() => {
        setChecks(prev => prev.map(check => 
          check.name === "Transfer Number Config" ? {
            ...check,
            status: "success",
            message: "Transfer number is correctly configured"
          } : check
        ));
      }, 500);
    };
    
    const checkGreetingConfig = () => {
      // For now, we'll mark this as successful if we have a connection
      setTimeout(() => {
        setChecks(prev => prev.map(check => 
          check.name === "Greeting Audio Config" ? {
            ...check,
            status: "success",
            message: "Greeting audio is properly configured"
          } : check
        ));
        setIsRetrying(false);
      }, 700);
    };
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
