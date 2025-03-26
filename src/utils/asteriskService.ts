
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

// Configuration for connecting to your Asterisk server
const ASTERISK_API_URL = "http://your-asterisk-server/api"; // Replace with your actual Asterisk API URL

export const asteriskService = {
  /**
   * Start dialing a contact list in the background via Asterisk
   */
  startDialing: async (options: DialContactsOptions): Promise<{ jobId: string }> => {
    const { contactListId, campaignId, transferNumber, sipProviderId, greetingFile } = options;
    
    console.log("Starting dial job with options:", options);
    
    try {
      // Make an actual API call to your backend which controls Asterisk
      const response = await fetch(`${ASTERISK_API_URL}/start-dialing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactListId,
          campaignId,
          transferNumber,
          sipProviderId,
          greetingFile,
          maxConcurrentCalls: 1 // Fixed at 1
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start dialing');
      }
      
      const data = await response.json();
      return {
        jobId: data.jobId
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
      const response = await fetch(`${ASTERISK_API_URL}/stop-dialing/${jobId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to stop dialing');
      }
      
      const data = await response.json();
      return { success: data.success };
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
      const response = await fetch(`${ASTERISK_API_URL}/dialing-status/${jobId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get dialing status');
      }
      
      return await response.json();
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
      const response = await fetch(`${ASTERISK_API_URL}/generate-config/${campaignId}`);
      
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
  }
};
