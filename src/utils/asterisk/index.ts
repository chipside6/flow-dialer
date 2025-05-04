
import { 
  getConfigFromStorage,
  saveConfigToStorage,
  hasConfiguredEnvironment,
  isHostedEnvironment,
  loadEnvironmentVariables
} from './config';

import { connectionService } from './connectionService';
import { dialingService } from './dialingService';
import { securityUtils } from './utils/securityUtils';
import { goipService } from './services/goipService';

// Load sensitive environment variables securely
loadEnvironmentVariables();  // This would load variables like ASTERISK_API_URL, ASTERISK_API_USERNAME, ASTERISK_API_PASSWORD

// Combined service for easier importing
export const asteriskService = {
  // Connection Management
  /**
   * Test connection to Asterisk
   */
  testConnection: async (): Promise<{ success: boolean, message: string }> => {
    try {
      const result = await connectionService.testConnection();
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Reload PJSIP configurations
   */
  reloadPjsip: async (): Promise<{ success: boolean, message: string }> => {
    try {
      const result = await connectionService.reloadPjsip();
      return result;
    } catch (error) {
      console.error('Failed to reload PJSIP:', error);
      return {
        success: false,
        message: `Error reloading PJSIP: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Reload extensions configuration
   */
  reloadExtensions: async (): Promise<{ success: boolean, message: string }> => {
    try {
      const result = await connectionService.reloadExtensions();
      return result;
    } catch (error) {
      console.error('Failed to reload extensions:', error);
      return {
        success: false,
        message: `Error reloading extensions: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  
  // Dialing Management
  /**
   * Configure the call flow for a campaign
   */
  configureCallFlow: async (campaignId: string, userId: string): Promise<{ success: boolean, message: string }> => {
    try {
      const result = await dialingService.configureCallFlow(campaignId, userId);
      return result;
    } catch (error) {
      console.error('Failed to configure call flow:', error);
      return {
        success: false,
        message: `Error configuring call flow: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Get the dialing status for a campaign
   */
  getDialingStatus: async (campaignId: string): Promise<{ success: boolean, status: string, details: any }> => {
    try {
      const status = await dialingService.getDialingStatus(campaignId);
      return {
        success: true,
        status: 'running',
        details: status,
      };
    } catch (error) {
      console.error('Failed to retrieve dialing status:', error);
      return {
        success: false,
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Start dialing for a campaign
   */
  startDialing: async (campaignId: string, contactListId: string, transferNumber: string, portNumber = 1): Promise<{ success: boolean, message: string, jobId?: string }> => {
    try {
      const result = await dialingService.startDialing(campaignId, contactListId, transferNumber, portNumber);
      return result;
    } catch (error) {
      console.error('Failed to start dialing:', error);
      return {
        success: false,
        message: `Error starting dialing: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Stop dialing for a campaign
   */
  stopDialing: async (campaignId: string): Promise<{ success: boolean, message: string }> => {
    try {
      const result = await dialingService.stopDialing(campaignId);
      return result;
    } catch (error) {
      console.error('Failed to stop dialing:', error);
      return {
        success: false,
        message: `Error stopping dialing: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  
  // GoIP Management
  /**
   * Get GoIP device status
   */
  goip: {
    /**
     * Get all GoIP devices for a user
     */
    getGoIPDevices: async (userId: string): Promise<{ success: boolean, devices: any[] }> => {
      try {
        const devices = await goipService.getGoIPDevices(userId);
        return { success: true, devices };
      } catch (error) {
        console.error('Failed to retrieve GoIP devices:', error);
        return { success: false, devices: [], message: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    /**
     * Register a GoIP device
     */
    registerDevice: async (userId: string, deviceData: any): Promise<{ success: boolean, message: string }> => {
      try {
        const result = await goipService.registerDevice(userId, deviceData);
        return result;
      } catch (error) {
        console.error('Failed to register GoIP device:', error);
        return {
          success: false,
          message: `Error registering GoIP device: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }
  }
};

// Configuration-related exports
export const asteriskConfig = {
  /**
   * Get configuration from local storage
   */
  getConfigFromStorage,

  /**
   * Save configuration to local storage
   */
  saveConfigToStorage,

  /**
   * Check if the environment is configured
   */
  hasConfiguredEnvironment,

  /**
   * Check if the environment is hosted
   */
  isHostedEnvironment
};

// Export security utilities
export { securityUtils };

// Export configuration constants
export {
  process.env.ASTERISK_API_URL as ASTERISK_API_URL,
  process.env.ASTERISK_API_USERNAME as ASTERISK_API_USERNAME,
  process.env.ASTERISK_API_PASSWORD as ASTERISK_API_PASSWORD
};
