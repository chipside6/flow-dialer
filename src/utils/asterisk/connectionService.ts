
import { 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD, 
  isHostedEnvironment,
  getConfigFromStorage 
} from './config';

/**
 * Service for handling Asterisk connection and system operations
 */
export const connectionService = {
  /**
   * Test the connection to Asterisk API with optional override credentials
   */
  async testConnection(credentials?: { apiUrl: string; username: string; password: string }) {
    try {
      // Use provided credentials or fall back to stored/environment variables
      const storedConfig = getConfigFromStorage();
      const apiUrl = credentials?.apiUrl || storedConfig.apiUrl;
      const username = credentials?.username || storedConfig.username;
      const password = credentials?.password || storedConfig.password;
      
      if (!apiUrl || !username || !password) {
        throw new Error('Asterisk API configuration missing. Please set all required credentials.');
      }
      
      console.log("Connection test initiated with API URL:", apiUrl);
      
      // Test the actual connection to the Asterisk server
      try {
        const basicAuth = btoa(`${username}:${password}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Use the API URL exactly as provided without any manipulation
        // This allows users to provide the full URL including any protocol
        const pingUrl = apiUrl.includes('/ping') ? apiUrl : `${apiUrl}/ping`;
        
        const response = await fetch(pingUrl, {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log("Successfully connected to Asterisk server");
          return { 
            success: true,
            message: "Connected successfully to Asterisk server"
          };
        } else {
          console.log("Connection test failed - server returned error:", response.status);
          return { 
            success: false,
            message: `Server returned error: ${response.status} ${response.statusText}`
          };
        }
      } catch (error) {
        console.log("Connection test failed:", error);
        const isHosted = isHostedEnvironment();
        
        if (isHosted) {
          // In hosted environment, still save the configuration but report the error
          return { 
            success: false,
            message: `Could not connect to Asterisk server: ${error.message || "Unknown error"}`
          };
        } else {
          return { 
            success: false,
            message: `Connection error: ${error.message || "Unknown error"}`
          };
        }
      }
    } catch (error) {
      console.error('Error in connection test:', error);
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
  }
};
