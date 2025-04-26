
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Validate configuration
    if (!config.apiUrl) {
      return { 
        success: false, 
        message: 'API URL is not configured. Please configure your Asterisk server settings.' 
      };
    }

    if (!config.username || !config.password) {
      return { 
        success: false, 
        message: 'Username or password is not configured. Please configure your Asterisk server settings.' 
      };
    }
    
    // Log the URL we're connecting to
    console.log(`Attempting to connect to Asterisk API at: ${config.apiUrl}`);
    
    try {
      // Parse the URL to check for scheme, host and port
      let apiUrlObj: URL;
      try {
        apiUrlObj = new URL(config.apiUrl);
        console.log(`Parsed URL: ${apiUrlObj.protocol}//${apiUrlObj.host}${apiUrlObj.pathname}`);
      } catch (e) {
        return { 
          success: false, 
          message: `Invalid API URL format. Please use format like "http://your-server:8088/ari"` 
        };
      }
      
      // Ensure the URL has a scheme
      if (!apiUrlObj.protocol || !apiUrlObj.host) {
        return { 
          success: false, 
          message: `API URL missing protocol or host. Please use format like "http://your-server:8088/ari"` 
        };
      }

      // Attempt the connection
      const response = await fetch(`${config.apiUrl}/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      console.log('Connection response status:', response.status);
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully connected to Asterisk ARI' 
        };
      } else {
        // Try to parse error response
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          return { 
            success: false, 
            message: `Error connecting to Asterisk: ${errorData.message || response.statusText} (Status: ${response.status})` 
          };
        } catch (error) {
          // If we can't parse JSON, return the status text
          return { 
            success: false, 
            message: `Error connecting to Asterisk: ${response.statusText} (Status: ${response.status})` 
          };
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      
      // Provide more helpful error messages based on the error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: `Could not reach Asterisk server at ${config.apiUrl}. Please check that your server is running and accessible.` 
        };
      }
      
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        return { 
          success: false, 
          message: `Network error connecting to ${config.apiUrl}. This might be due to CORS restrictions or the server being unreachable.` 
        };
      }
      
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  /**
   * Reload PJSIP configuration
   */
  reloadPjsip: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}/asterisk/modules/pjsip/reload`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully reloaded PJSIP configuration' 
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Error reloading PJSIP: ${errorData.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error reloading PJSIP: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  /**
   * Reload extensions (dialplan)
   */
  reloadExtensions: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      const response = await fetch(`${config.apiUrl}/asterisk/reload`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully reloaded Asterisk configuration' 
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Error reloading Asterisk: ${errorData.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error reloading Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
};
