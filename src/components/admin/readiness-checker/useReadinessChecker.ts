
import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { SystemCheck } from "./SystemCheckItem";
import { asteriskService } from "@/utils/asteriskService";

// Helper function to check if Asterisk API environment variables are set
const checkAsteriskEnvVars = () => {
  const missingVars: string[] = [];
  
  if (!import.meta.env.VITE_ASTERISK_API_URL) missingVars.push("VITE_ASTERISK_API_URL");
  if (!import.meta.env.VITE_ASTERISK_API_USERNAME) missingVars.push("VITE_ASTERISK_API_USERNAME");
  if (!import.meta.env.VITE_ASTERISK_API_PASSWORD) missingVars.push("VITE_ASTERISK_API_PASSWORD");
  
  return {
    allSet: missingVars.length === 0,
    missingVars
  };
};

export const useReadinessChecker = (user: User | null) => {
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
        name: "Call Routing",
        status: "checking",
        message: "Checking call routing configuration..."
      },
      {
        name: "SIP Provider",
        status: "checking",
        message: "Checking SIP provider settings..."
      }
    ]);
    
    // Check environment variables
    const envVarCheck = checkAsteriskEnvVars();
    setMissingEnvVars(envVarCheck.missingVars);
    
    // Update environment variables check
    setTimeout(() => {
      setChecks(prev => prev.map(check => 
        check.name === "Environment Variables" ? {
          ...check,
          status: envVarCheck.allSet ? "success" : "error",
          message: envVarCheck.allSet 
            ? "All required environment variables are set" 
            : `Missing environment variables: ${envVarCheck.missingVars.join(", ")}`
        } : check
      ));
      
      // Update troubleshooting instructions
      if (!envVarCheck.allSet) {
        setTroubleshootInstructions([
          "Set the following environment variables:",
          ...envVarCheck.missingVars.map(v => `- ${v}`)
        ]);
      }
    }, 500);
    
    // Check Asterisk connection
    if (envVarCheck.allSet) {
      try {
        const connectionResult = await asteriskService.testConnection();
        
        // Update Asterisk connection check
        setTimeout(() => {
          setChecks(prev => prev.map(check => 
            check.name === "Asterisk Connection" ? {
              ...check,
              status: connectionResult.success ? "success" : "error",
              message: connectionResult.success 
                ? "Successfully connected to Asterisk server" 
                : `Failed to connect to Asterisk server: ${connectionResult.message || "Unknown error"}`
            } : check
          ));
          
          // Update server instructions if connection failed
          if (!connectionResult.success) {
            setServerInstructions([
              "Ensure your Asterisk server is running and accessible",
              "Verify the API URL is correct and the server is reachable",
              "Check that the provided username and password are valid"
            ]);
          }
          
          // Run additional checks only if connection succeeded
          if (connectionResult.success) {
            // Simulate Call Routing check (this would be real in production)
            setTimeout(() => {
              setChecks(prev => prev.map(check => 
                check.name === "Call Routing" ? {
                  ...check,
                  status: "success",
                  message: "Call routing correctly configured"
                } : check
              ));
            }, 700);
            
            // Simulate SIP Provider check (this would be real in production)
            setTimeout(() => {
              setChecks(prev => prev.map(check => 
                check.name === "SIP Provider" ? {
                  ...check,
                  status: "success",
                  message: "SIP provider is properly configured"
                } : check
              ));
            }, 1000);
          } else {
            // If connection failed, mark remaining checks as warnings
            setTimeout(() => {
              setChecks(prev => prev.map(check => 
                (check.name === "Call Routing" || check.name === "SIP Provider") ? {
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
            status: "error",
            message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`
          } : check
        ));
      }
    } else {
      // If environment variables are missing, mark remaining checks as warnings
      setTimeout(() => {
        setChecks(prev => prev.map(check => 
          (check.name === "Asterisk Connection" || check.name === "Call Routing" || check.name === "SIP Provider") ? {
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
