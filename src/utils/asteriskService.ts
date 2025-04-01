import { 
  createDialerError, 
  DialerErrorType, 
  handleDialerError 
} from "@/utils/errorHandlingUtils";

interface DialContactsOptions {
  contactListId: string;
  campaignId: string;
  transferNumber?: string;
  sipProviderId: string;
  greetingFile?: string;
  maxConcurrentCalls?: number;
}

// Export Asterisk API credentials so they can be accessed by other components
export const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || "http://your-asterisk-server:8088/ari";
export const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || "asterisk";
export const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || "asterisk";

// SIP Configuration defaults
export const SIP_CONFIG = {
  defaultContext: "from-external",
  defaultTransport: "udp",
  defaultCodecs: ["ulaw", "alaw", "g729"],
  defaultPort: "5060",
  maxRetries: 3,
  retryInterval: 60, // seconds
  callTimeout: 30,   // seconds
};

// Authentication headers for Asterisk REST Interface
const getAuthHeaders = () => {
  const basicAuth = btoa(`${ASTERISK_API_USERNAME}:${ASTERISK_API_PASSWORD}`);
  return {
    'Authorization': `Basic ${basicAuth}`,
    'Content-Type': 'application/json',
  };
};

export const asteriskService = {
  /**
   * Start dialing a contact list in the background via Asterisk
   */
  startDialing: async (options: DialContactsOptions): Promise<{ jobId: string }> => {
    const { contactListId, campaignId, transferNumber, sipProviderId, greetingFile } = options;
    
    console.log("Starting dial job with options:", options);
    
    try {
      // Make an actual API call to your Asterisk server
      const response = await fetch(`${ASTERISK_API_URL}/channels/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          endpoint: sipProviderId,
          extension: 'start-campaign',
          context: `campaign-${campaignId}`,
          variables: {
            CAMPAIGN_ID: campaignId,
            CONTACT_LIST_ID: contactListId,
            TRANSFER_NUMBER: transferNumber || '',
            GREETING_FILE: greetingFile || 'beep',
            MAX_CONCURRENT: options.maxConcurrentCalls || 1
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start dialing');
      }
      
      const data = await response.json();
      return {
        jobId: data.id || `job-${Date.now()}`
      };
    } catch (error) {
      console.error("Error starting dialing job:", error);
      handleDialerError(createDialerError(
        DialerErrorType.CONNECTION,
        "Could not connect to Asterisk server. Please check your server configuration.",
        error
      ));
      
      // Return a fallback job ID to prevent UI errors
      return {
        jobId: `offline-${Date.now()}`
      };
    }
  },
  
  /**
   * Stop an active dialing job
   */
  stopDialing: async (jobId: string): Promise<{ success: boolean }> => {
    console.log("Stopping dial job:", jobId);
    
    try {
      const response = await fetch(`${ASTERISK_API_URL}/channels/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to stop dialing');
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error stopping dialing job:", error);
      handleDialerError(createDialerError(
        DialerErrorType.CONNECTION,
        "Could not connect to Asterisk server to stop dialing.",
        error
      ));
      
      return { success: false };
    }
  },
  
  /**
   * Get status of a dialing job
   */
  getDialingStatus: async (jobId: string): Promise<{
    status: 'running' | 'completed' | 'failed' | 'stopped';
    totalCalls: number;
    completedCalls: number;
    answeredCalls: number;
    failedCalls: number;
  }> => {
    console.log("Getting status for job:", jobId);
    
    try {
      const response = await fetch(`${ASTERISK_API_URL}/bridges/${jobId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get dialing status');
      }
      
      const data = await response.json();
      
      // Parse bridge channel information to get call statistics
      return {
        status: data.channels && data.channels.length > 0 ? 'running' : 'completed',
        totalCalls: data.statistics?.total || 0,
        completedCalls: data.statistics?.completed || 0,
        answeredCalls: data.statistics?.answered || 0, 
        failedCalls: data.statistics?.failed || 0
      };
    } catch (error) {
      console.error("Error getting dialing status:", error);
      handleDialerError(createDialerError(
        DialerErrorType.CONNECTION,
        "Could not retrieve status from Asterisk server.",
        error
      ));
      
      // Return fallback status to prevent UI errors
      return {
        status: 'failed',
        totalCalls: 0,
        completedCalls: 0,
        answeredCalls: 0,
        failedCalls: 0
      };
    }
  },
  
  /**
   * Generate Asterisk configuration for a campaign
   */
  generateAsteriskConfig: async (campaignId: string): Promise<{
    sipConfig: string;
    dialplanConfig: string;
  }> => {
    console.log("Generating Asterisk config for campaign:", campaignId);
    
    try {
      // Get the configuration from the backend API
      const response = await fetch(`/api/campaigns/asterisk-config/${campaignId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add any authorization headers needed
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate Asterisk config');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error generating Asterisk config:", error);
      handleDialerError(createDialerError(
        DialerErrorType.CONFIGURATION,
        "Could not generate Asterisk configuration.",
        error
      ));
      
      return {
        sipConfig: '',
        dialplanConfig: ''
      };
    }
  },
  
  /**
   * Generate a SIP trunk configuration for a specific provider
   */
  generateSipTrunkConfig: (providerName: string, host: string, port: string, username: string, password: string): string => {
    return `
[${providerName}]
type=peer
host=${host}
port=${port || SIP_CONFIG.defaultPort}
username=${username}
secret=${password}
fromuser=${username}
context=${SIP_CONFIG.defaultContext}
insecure=port,invite
disallow=all
allow=${SIP_CONFIG.defaultCodecs.join(',')}
transport=${SIP_CONFIG.defaultTransport}
dtmfmode=rfc2833
nat=force_rport,comedia
qualify=yes
    `.trim();
  },
  
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    console.log("Testing connection to Asterisk server:", ASTERISK_API_URL);
    
    try {
      const response = await fetch(`${ASTERISK_API_URL}/applications`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return {
        success: true,
        message: "Successfully connected to Asterisk server"
      };
    } catch (error) {
      console.error("Error connecting to Asterisk server:", error);
      return {
        success: false,
        message: `Failed to connect: ${error.message}`
      };
    }
  }
};
