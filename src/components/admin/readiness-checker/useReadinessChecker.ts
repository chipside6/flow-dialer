
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ASTERISK_API_URL, ASTERISK_API_USERNAME, ASTERISK_API_PASSWORD } from "@/utils/asteriskService";
import { toast } from "@/components/ui/use-toast";
import { SystemCheck } from "./SystemCheckItem";

export const useReadinessChecker = (user: any) => {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: "Supabase Connection", status: "checking", message: "Checking connection..." },
    { name: "Asterisk Connection", status: "checking", message: "Checking Asterisk server..." },
    { name: "Environment Variables", status: "checking", message: "Checking configuration..." },
    { name: "Authentication", status: "checking", message: "Verifying authentication..." }
  ]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [serverInstructions, setServerInstructions] = useState<string | null>(null);
  const [troubleshootInstructions, setTroubleshootInstructions] = useState<string | null>(null);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);

  // Update a specific check
  const updateCheck = (name: string, status: SystemCheck["status"], message: string) => {
    setChecks(prev => 
      prev.map(check => 
        check.name === name ? { ...check, status, message } : check
      )
    );
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

  const runChecks = async () => {
    setIsRetrying(true);
    setServerInstructions(null);
    setTroubleshootInstructions(null);
    setMissingEnvVars([]);
    
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
        updateCheck("Asterisk Connection", "error", "Asterisk URL not configured. Configure in SIP Configuration tab or set VITE_ASTERISK_API_URL environment variable.");
        setServerInstructions("Configure your Asterisk server first and update the URL in the SIP Configuration tab.");
      } else if (!effectiveUsername || !effectivePassword) {
        updateCheck("Asterisk Connection", "error", "Asterisk credentials not configured. Configure in SIP Configuration tab or set VITE_ASTERISK_API_USERNAME and VITE_ASTERISK_API_PASSWORD environment variables.");
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
      { name: "VITE_ASTERISK_API_URL", value: import.meta.env.VITE_ASTERISK_API_URL },
      { name: "VITE_ASTERISK_API_USERNAME", value: import.meta.env.VITE_ASTERISK_API_USERNAME },
      { name: "VITE_ASTERISK_API_PASSWORD", value: import.meta.env.VITE_ASTERISK_API_PASSWORD }
    ];
    
    const missing = requiredVars.filter(v => !v.value);
    setMissingEnvVars(missing.map(v => v.name));
    
    if (missing.length === 0) {
      updateCheck("Environment Variables", "success", "All required environment variables are set");
    } else {
      // Check if we have localStorage values for Asterisk settings
      const hasStoredAsteriskSettings = 
        localStorage.getItem("asterisk_api_url") && 
        localStorage.getItem("asterisk_api_username") && 
        localStorage.getItem("asterisk_api_password");
      
      const message = `Missing ${missing.length} variables: ${missing.map(v => v.name).join(', ')}`;
      
      // If some Asterisk settings are missing but we have localStorage values, show as warning instead of error
      if (missing.every(v => v.name.startsWith('VITE_ASTERISK_')) && hasStoredAsteriskSettings) {
        updateCheck("Environment Variables", "warning", 
          "Using locally stored Asterisk settings instead of environment variables");
      } else {
        updateCheck("Environment Variables", "error", message);
      }
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

  // Run checks on initial load and when user changes
  useEffect(() => {
    runChecks();
  }, [user]);

  return {
    checks,
    isRetrying,
    serverInstructions,
    troubleshootInstructions,
    missingEnvVars,
    runChecks
  };
};
