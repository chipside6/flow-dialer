import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { API_URL } from "@/services/api/apiConfig";
import { ASTERISK_API_URL, ASTERISK_API_USERNAME, ASTERISK_API_PASSWORD, asteriskService } from "@/utils/asteriskService";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface SystemCheck {
  name: string;
  status: "checking" | "success" | "error" | "warning";
  message: string;
}

const LaunchReadinessChecker = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: "Supabase Connection", status: "checking", message: "Checking connection..." },
    { name: "API Connection", status: "checking", message: "Checking API..." },
    { name: "Asterisk Connection", status: "checking", message: "Checking Asterisk server..." },
    { name: "Environment Variables", status: "checking", message: "Checking configuration..." },
    { name: "Authentication", status: "checking", message: "Verifying authentication..." }
  ]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [serverInstructions, setServerInstructions] = useState<string | null>(null);
  const [troubleshootInstructions, setTroubleshootInstructions] = useState<string | null>(null);
  const [apiConfigInstructions, setApiConfigInstructions] = useState<string | null>(null);

  const runChecks = async () => {
    setIsRetrying(true);
    setServerInstructions(null);
    setTroubleshootInstructions(null);
    setApiConfigInstructions(null);
    
    // Reset checks to "checking" state
    setChecks(prev => 
      prev.map(check => ({ ...check, status: "checking", message: `Checking ${check.name.toLowerCase()}...` }))
    );
    
    toast({
      title: "Running checks",
      description: "Verifying your system configuration...",
    });
    
    // Check Supabase Connection
    try {
      const { data, error } = await supabase.from('contact_lists').select('count').limit(1);
      if (error) throw error;
      updateCheck("Supabase Connection", "success", "Connected to Supabase successfully");
    } catch (error) {
      updateCheck("Supabase Connection", "error", `Failed to connect: ${error.message}`);
    }

    // Check API Connection
    try {
      // Get stored API URL from localStorage or use environment variable
      const storedApiUrl = localStorage.getItem("api_url");
      const effectiveApiUrl = storedApiUrl || API_URL;
      
      // Check if API URL is configured
      if (!effectiveApiUrl) {
        updateCheck("API Connection", "error", "API URL not configured. Set VITE_API_URL environment variable or configure in settings.");
        setApiConfigInstructions(getApiConfigInstructions());
      } else {
        try {
          const response = await fetch(`${effectiveApiUrl}/health`, { 
            method: 'GET',
            // Set a shorter timeout for the health check
            signal: AbortSignal.timeout(5000)
          });
          if (!response.ok) throw new Error(`Status: ${response.status}`);
          updateCheck("API Connection", "success", "API is reachable");
        } catch (fetchError) {
          updateCheck("API Connection", "error", `API unreachable: ${fetchError.message}`);
          setApiConfigInstructions(getApiConfigInstructions());
        }
      }
    } catch (error) {
      updateCheck("API Connection", "error", `Error checking API: ${error.message}`);
      setApiConfigInstructions(getApiConfigInstructions());
    }

    // Check Asterisk Connection
    try {
      // Get stored values from localStorage to ensure we're using latest settings
      const storedApiUrl = localStorage.getItem("asterisk_api_url");
      const storedUsername = localStorage.getItem("asterisk_api_username");
      const storedPassword = localStorage.getItem("asterisk_api_password");
      
      const effectiveApiUrl = storedApiUrl || ASTERISK_API_URL;
      const effectiveUsername = storedUsername || ASTERISK_API_USERNAME;
      const effectivePassword = storedPassword || ASTERISK_API_PASSWORD;
      
      if (!effectiveApiUrl || effectiveApiUrl === "" || effectiveApiUrl === "http://your-asterisk-server:8088/ari") {
        updateCheck("Asterisk Connection", "error", "Asterisk URL not configured. Set VITE_ASTERISK_API_URL environment variable or configure in SIP Configuration tab.");
        setServerInstructions("Configure your Asterisk server first and update the URL in the SIP Configuration tab.");
      } else if (!effectiveUsername || !effectivePassword) {
        updateCheck("Asterisk Connection", "error", "Asterisk credentials not configured. Set VITE_ASTERISK_API_USERNAME and VITE_ASTERISK_API_PASSWORD environment variables or configure in SIP Configuration tab.");
        setServerInstructions("Configure your Asterisk API credentials in the SIP Configuration tab.");
      } else {
        // Use the temporary service to test the connection with latest settings
        try {
          const basicAuth = btoa(`${effectiveUsername}:${effectivePassword}`);
          const response = await fetch(`${effectiveApiUrl}/applications`, {
            headers: {
              'Authorization': `Basic ${basicAuth}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          updateCheck("Asterisk Connection", "success", "Successfully connected to Asterisk server");
        } catch (connectionError) {
          updateCheck("Asterisk Connection", "error", `Error testing connection: ${connectionError.message}`);
          setServerInstructions(getAsteriskSetupInstructions(effectiveApiUrl));
          setTroubleshootInstructions(getAsteriskTroubleshootingInstructions());
        }
      }
    } catch (error) {
      updateCheck("Asterisk Connection", "error", `Error testing Asterisk connection: ${error.message}`);
      setTroubleshootInstructions(getAsteriskTroubleshootingInstructions());
    }

    // Check Environment Variables
    const requiredVars = [
      { name: "VITE_SUPABASE_URL", value: import.meta.env.VITE_SUPABASE_URL }, 
      { name: "VITE_SUPABASE_PUBLISHABLE_KEY", value: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, 
      { name: "VITE_API_URL", value: import.meta.env.VITE_API_URL }, 
      { name: "VITE_ASTERISK_API_URL", value: import.meta.env.VITE_ASTERISK_API_URL },
      { name: "VITE_ASTERISK_API_USERNAME", value: import.meta.env.VITE_ASTERISK_API_USERNAME },
      { name: "VITE_ASTERISK_API_PASSWORD", value: import.meta.env.VITE_ASTERISK_API_PASSWORD }
    ];
    
    const missingVars = requiredVars.filter(v => !v.value);
    
    if (missingVars.length === 0) {
      updateCheck("Environment Variables", "success", "All required environment variables are set");
    } else {
      updateCheck(
        "Environment Variables", 
        "error", 
        `Missing variables: ${missingVars.map(v => v.name).join(', ')}`
      );
    }

    // Check Authentication
    if (user) {
      updateCheck("Authentication", "success", "Authentication is working");
    } else {
      updateCheck("Authentication", "warning", "Not authenticated. Please login to verify authentication");
    }
    
    setIsRetrying(false);
    
    toast({
      title: "Checks completed",
      description: "System configuration verification finished.",
    });
  };

  const getApiConfigInstructions = (): string => {
    return `
1. Set the API URL in one of these ways:

   Option 1: Environment Variable
   Add VITE_API_URL to your environment with your API endpoint URL
   Example: VITE_API_URL=http://your-api-server:5000/api

   Option 2: Local Storage Configuration
   You can set the API URL directly in your browser's local storage:
   - Open browser developer tools (F12)
   - Go to Application tab > Local Storage
   - Add a key 'api_url' with your API endpoint value
   
   Option 3: Backend Server
   If you're running the included Node.js backend:
   - Make sure it's running (cd backend && npm start)
   - Use http://localhost:5000/api as your API URL
   - The backend should have a /health endpoint available
   `;
  };

  const getAsteriskSetupInstructions = (url: string): string => {
    // Get stored values from localStorage to ensure we're using latest settings
    const storedUsername = localStorage.getItem("asterisk_api_username") || ASTERISK_API_USERNAME || 'asterisk';
    
    return `
1. Install Asterisk on your server if not already installed
2. Enable ARI (Asterisk REST Interface) in asterisk.conf
3. Configure ARI user in ari.conf:
   [general]
   enabled = yes
   
   [${storedUsername}]
   type = user
   password = ${localStorage.getItem("asterisk_api_password") || ASTERISK_API_PASSWORD || 'asterisk'}
   password_format = plain
   read_only = no
   
4. Make sure Asterisk is running and the ARI endpoint is accessible at ${url}
5. Open required ports in your firewall (typically 8088 for ARI)
    `;
  };

  const getAsteriskTroubleshootingInstructions = (): string => {
    return `
COMMON ASTERISK TROUBLESHOOTING:

1. Check Asterisk is running:
   systemctl status asterisk

2. Check Asterisk version (different commands based on version):
   asterisk -rx "core show version"

3. Check which SIP stack you're using:
   For PJSIP (newer Asterisk versions):
   - asterisk -rx "module show like pjsip"
   - asterisk -rx "pjsip show endpoints" 
   - asterisk -rx "pjsip show registrations"

   For chan_sip (older Asterisk versions):
   - asterisk -rx "module show like chan_sip"
   - asterisk -rx "sip show peers"

4. Verify your dialplan is loaded properly:
   asterisk -rx "dialplan show"

5. Check if ARI is enabled and ARI endpoints:
   asterisk -rx "ari show status"
   asterisk -rx "ari show users"

6. Common error solutions:
   - "No such command": Using command for the wrong SIP stack or module not loaded
   - "No object found": This error means Asterisk couldn't find the resource you're looking for. Solutions:
     * For "pjsip show endpoints" - You need to add endpoints to pjsip.conf first
     * For ARI commands - Make sure applications are defined in ari.conf
     * For any command - Check if the module is loaded with "module show like X"
     * After adding configuration - Reload the appropriate module with "module reload X"
   - Connection refused: Firewall blocking access or service not running

7. "No object found" specific steps:
   a. If you're seeing this with PJSIP:
      - Make sure you've added your SIP provider configuration to pjsip.conf
      - Reload the PJSIP module: asterisk -rx "pjsip reload"
      - Verify the configuration format is correct (Asterisk 13+ uses different syntax)
   
   b. If you're seeing this with ARI:
      - Make sure you've enabled ARI in asterisk.conf
      - Make sure your ARI user is defined in ari.conf
      - Restart Asterisk or reload the res_ari module

8. After making configuration changes, reload Asterisk modules:
   asterisk -rx "module reload"
   asterisk -rx "dialplan reload"
   asterisk -rx "pjsip reload" or "sip reload" (based on your SIP stack)
`;
  };

  useEffect(() => {
    runChecks();
  }, [user]);

  const updateCheck = (name: string, status: SystemCheck["status"], message: string) => {
    setChecks(prev => 
      prev.map(check => 
        check.name === name ? { ...check, status, message } : check
      )
    );
  };

  const handleRetry = () => {
    runChecks();
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Launch Readiness Checker</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry} 
          disabled={isRetrying}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Retry Checks
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => (
            <div 
              key={check.name} 
              className="flex items-start p-3 border rounded-md"
            >
              <div className="mr-3 mt-0.5">
                {check.status === "checking" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                {check.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {check.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                {check.status === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <div>
                <p className="font-medium">{check.name}</p>
                <p className={`text-sm ${
                  check.status === "error" ? "text-red-500" : 
                  check.status === "warning" ? "text-amber-500" : 
                  check.status === "success" ? "text-green-500" : 
                  "text-gray-500"
                }`}>
                  {check.message}
                </p>
              </div>
            </div>
          ))}
          
          {apiConfigInstructions && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-medium text-blue-800 mb-2">API Configuration Instructions</h3>
              <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-blue-100 overflow-x-auto text-blue-900">
                {apiConfigInstructions}
              </pre>
            </div>
          )}
          
          {serverInstructions && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Server Setup Instructions</h3>
              <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-blue-100 overflow-x-auto text-blue-900">
                {serverInstructions}
              </pre>
            </div>
          )}

          {troubleshootInstructions && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="text-lg font-medium text-amber-800 mb-2">Troubleshooting Guide</h3>
              <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-amber-100 overflow-x-auto text-amber-900">
                {troubleshootInstructions}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchReadinessChecker;
