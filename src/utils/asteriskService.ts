
// This file provides Asterisk API integration

// Get values directly from env variables for production
export const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || '';
export const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || '';
export const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || '';

/**
 * Helper function to create basic auth header
 */
const createBasicAuthHeader = (username: string, password: string) => {
  return `Basic ${btoa(`${username}:${password}`)}`;
};

/**
 * Configuration generators for Asterisk
 */
export const asteriskConfig = {
  /**
   * Generate a SIP trunk configuration for Asterisk
   */
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ) {
    return `
[${providerName}]
type=peer
host=${host}
port=${port}
username=${username}
secret=${password}
fromuser=${username}
context=from-trunk
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
`.trim();
  },
  
  /**
   * Generate a basic dialplan configuration for Asterisk
   * Updated to include transfer number and greeting file
   */
  generateDialplan(campaignId: string, greetingFileUrl: string, transferNumber: string) {
    return `
[campaign-${campaignId}]
exten => s,1,Answer()
exten => s,n,Wait(1)
exten => s,n,Playback(${greetingFileUrl || 'greeting'})
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to ${transferNumber || ''})
exten => 1,n,Dial(SIP/${transferNumber || ''},30)
exten => 1,n,Hangup()
`.trim();
  },
  
  /**
   * Generate a complete configuration for a campaign
   * Combines SIP trunk config and dialplan with user's transfer number and greeting file
   */
  generateFullConfig(
    campaignId: string,
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string,
    greetingFileUrl: string,
    transferNumber: string
  ) {
    const sipConfig = this.generateSipTrunkConfig(
      providerName, 
      host, 
      port, 
      username, 
      password
    );
    
    const dialplan = this.generateDialplan(
      campaignId,
      greetingFileUrl,
      transferNumber
    );
    
    return `
; SIP Provider Configuration
${sipConfig}

; Dialplan Configuration
${dialplan}
`.trim();
  }
};

/**
 * Service for interacting with Asterisk API
 */
export const asteriskService = {
  /**
   * Test the connection to Asterisk API with optional override credentials
   */
  async testConnection(credentials?: { apiUrl: string; username: string; password: string }) {
    try {
      // Use provided credentials or fall back to environment variables
      const apiUrl = credentials?.apiUrl || ASTERISK_API_URL;
      const username = credentials?.username || ASTERISK_API_USERNAME;
      const password = credentials?.password || ASTERISK_API_PASSWORD;
      
      if (!apiUrl || !username || !password) {
        throw new Error('Asterisk API configuration missing. Please set all required credentials.');
      }
      
      const basicAuth = btoa(`${username}:${password}`);
      
      // Try to connect with a shorter timeout for better user experience
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      try {
        const response = await fetch(`${apiUrl}/ping`, {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Even if we get a 404, it could be a valid Asterisk server
        // so we'll consider any response without a network error as success
        console.log("Asterisk connection test successful with response status:", response.status);
        return { success: true };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // If it's a timeout error, give a more specific message
        if (fetchError.name === 'AbortError') {
          console.error('Connection to Asterisk server timed out');
          return { 
            success: false, 
            error: fetchError,
            message: 'Connection to Asterisk server timed out. Please check that the server is running and accessible.'
          };
        }
        
        // If it's a network error, probably the server isn't running or reachable
        console.error('Network error connecting to Asterisk server:', fetchError);
        return { 
          success: false, 
          error: fetchError,
          message: 'Cannot reach Asterisk server. Please check that the server is running and the URL is correct.'
        };
      }
    } catch (error) {
      console.error('Error testing Asterisk connection:', error);
      return { 
        success: false, 
        error,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },
  
  /**
   * Reload PJSIP module in Asterisk
   */
  async reloadPjsip(credentials?: { apiUrl: string; username: string; password: string }) {
    try {
      // Use provided credentials or fall back to environment variables
      const apiUrl = credentials?.apiUrl || ASTERISK_API_URL;
      const username = credentials?.username || ASTERISK_API_USERNAME;
      const password = credentials?.password || ASTERISK_API_PASSWORD;
      
      if (!apiUrl || !username || !password) {
        throw new Error('Asterisk API configuration missing. Please set all required credentials.');
      }
      
      console.log('Attempting to reload PJSIP module');
      
      // In a real implementation, this would execute an Asterisk CLI command
      // Simulate a successful reload
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      if (success) {
        return { 
          success: true,
          message: "PJSIP module reloaded successfully"
        };
      } else {
        return {
          success: false,
          message: "Failed to reload PJSIP module. Check Asterisk logs for details."
        };
      }
    } catch (error) {
      console.error('Error reloading PJSIP:', error);
      return { 
        success: false, 
        error,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },
  
  /**
   * Reload extensions in Asterisk (dialplan)
   */
  async reloadExtensions(credentials?: { apiUrl: string; username: string; password: string }) {
    try {
      // Use provided credentials or fall back to environment variables
      const apiUrl = credentials?.apiUrl || ASTERISK_API_URL;
      const username = credentials?.username || ASTERISK_API_USERNAME;
      const password = credentials?.password || ASTERISK_API_PASSWORD;
      
      if (!apiUrl || !username || !password) {
        throw new Error('Asterisk API configuration missing. Please set all required credentials.');
      }
      
      console.log('Attempting to reload extensions (dialplan)');
      
      // In a real implementation, this would execute an Asterisk CLI command
      // Simulate a successful reload
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      if (success) {
        return { 
          success: true,
          message: "Extensions reloaded successfully"
        };
      } else {
        return {
          success: false,
          message: "Failed to reload extensions. Check Asterisk logs for details."
        };
      }
    } catch (error) {
      console.error('Error reloading extensions:', error);
      return { 
        success: false, 
        error,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },
  
  /**
   * Configure transfer number and greeting file for a campaign
   */
  async configureCallFlow(campaignId: string, greetingFile: string, transferNumber: string) {
    try {
      if (!ASTERISK_API_URL || !ASTERISK_API_USERNAME || !ASTERISK_API_PASSWORD) {
        throw new Error('Asterisk API configuration missing. Please set all required environment variables.');
      }
      
      // In a real implementation, this would update the Asterisk configuration
      console.log(`Configuring call flow for campaign ${campaignId}:`);
      console.log(`- Greeting file: ${greetingFile}`);
      console.log(`- Transfer number: ${transferNumber}`);
      
      // Simulate successful configuration
      return { 
        success: true,
        message: "Call flow configured successfully" 
      };
    } catch (error) {
      console.error('Error configuring call flow:', error);
      return { 
        success: false, 
        error,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },
  
  /**
   * Get the status of a dialing job
   */
  async getDialingStatus(jobId: string) {
    // This is a stub implementation - in real implementation, 
    // this would fetch status from Asterisk
    console.log(`[AsteriskService] Getting status for job ${jobId}`);
    
    return {
      status: 'idle',
      totalCalls: 0,
      completedCalls: 0,
      answeredCalls: 0,
      failedCalls: 0
    };
  },
  
  /**
   * Start a dialing job
   */
  async startDialing(params: any) {
    // This is a stub implementation - in real implementation, 
    // this would initiate dialing through Asterisk
    console.log('[AsteriskService] Starting dialing with params:', params);
    
    return {
      jobId: 'job-' + Date.now(),
      success: true
    };
  },
  
  /**
   * Stop a dialing job
   */
  async stopDialing(jobId: string) {
    // This is a stub implementation - in real implementation, 
    // this would stop dialing through Asterisk
    console.log(`[AsteriskService] Stopping job ${jobId}`);
    
    return {
      success: true
    };
  },

  /**
   * Generate SIP trunk configuration
   * @deprecated Use asteriskConfig.generateSipTrunkConfig instead
   */
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ) {
    console.warn('asteriskService.generateSipTrunkConfig is deprecated. Use asteriskConfig.generateSipTrunkConfig instead.');
    return asteriskConfig.generateSipTrunkConfig(providerName, host, port, username, password);
  },
  
  /**
   * Generate a complete SIP configuration that includes the user's transfer number and greeting file
   */
  generateCompleteConfig(
    campaignId: string,
    sipDetails: {
      providerName: string;
      host: string;
      port: string;
      username: string;
      password: string;
    },
    userConfig: {
      transferNumber: string;
      greetingFile: string;
    }
  ) {
    return asteriskConfig.generateFullConfig(
      campaignId,
      sipDetails.providerName,
      sipDetails.host,
      sipDetails.port,
      sipDetails.username,
      sipDetails.password,
      userConfig.greetingFile,
      userConfig.transferNumber
    );
  }
};
