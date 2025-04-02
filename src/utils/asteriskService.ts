
// This file provides Asterisk API integration

// Default values for Asterisk API (if not provided in env vars)
export const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || localStorage.getItem("asterisk_api_url") || '';
export const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || localStorage.getItem("asterisk_api_username") || '';
export const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || localStorage.getItem("asterisk_api_password") || '';

export const asteriskService = {
  // Method to test Asterisk connection
  async testConnection() {
    try {
      if (!ASTERISK_API_URL || !ASTERISK_API_USERNAME || !ASTERISK_API_PASSWORD) {
        throw new Error('Asterisk API configuration missing');
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
      return { success: false, error };
    }
  },
  
  // Method to get dialing status
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
  
  // Method to start dialing
  async startDialing(params: any) {
    // This is a stub implementation - in real implementation, 
    // this would initiate dialing through Asterisk
    console.log('[AsteriskService] Starting dialing with params:', params);
    
    return {
      jobId: 'job-' + Date.now(),
      success: true
    };
  },
  
  // Method to stop dialing
  async stopDialing(jobId: string) {
    // This is a stub implementation - in real implementation, 
    // this would stop dialing through Asterisk
    console.log(`[AsteriskService] Stopping job ${jobId}`);
    
    return {
      success: true
    };
  },

  // Method to generate SIP trunk configuration
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ) {
    // Generate a basic SIP trunk configuration for Asterisk
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
  }
};
