
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
  }
};

/**
 * Service for interacting with Asterisk API
 */
export const asteriskService = {
  /**
   * Test the connection to Asterisk API
   */
  async testConnection() {
    try {
      if (!ASTERISK_API_URL || !ASTERISK_API_USERNAME || !ASTERISK_API_PASSWORD) {
        throw new Error('Asterisk API configuration missing. Please set all required environment variables.');
      }
      
      const basicAuth = btoa(`${ASTERISK_API_USERNAME}:${ASTERISK_API_PASSWORD}`);
      const response = await fetch(`${ASTERISK_API_URL}/applications`, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return { success: true };
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
  }
};
