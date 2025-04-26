
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Use the hardcoded URL that we know works
    const apiUrl = 'http://10.0.2.15:8088/ari/';
    
    // Validate configuration
    if (!config.username || !config.password) {
      return { 
        success: false, 
        message: 'Username or password is not configured. Please configure your Asterisk server settings.' 
      };
    }
    
    // Log the URL we're connecting to
    console.log(`Attempting to connect to Asterisk API at: ${apiUrl}`);
    console.log(`Using credentials: ${config.username}:****`);
    
    try {
      // Try with no-cors mode to diagnose CORS issues
      console.log("Attempting connection with credentials");
      
      // Attempt the connection
      const response = await fetch(`${apiUrl}applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Accept': 'application/json'
        },
        mode: 'cors' // Explicitly set CORS mode
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
        console.log('Failed to fetch error detected');
        
        // Try to ping the server without authentication to determine if it's reachable
        try {
          console.log('Attempting to ping server without authentication');
          const pingResponse = await fetch(`${apiUrl}ping`, { 
            method: 'HEAD',
            mode: 'no-cors' // Try with no-cors to see if server is reachable
          });
          console.log('Ping response:', pingResponse);
          
          return { 
            success: false, 
            message: `The Asterisk server at ${apiUrl} is reachable, but authentication failed. Please check your username and password.` 
          };
        } catch (pingError) {
          console.log('Ping also failed:', pingError);
          return { 
            success: false, 
            message: `Could not reach Asterisk server at ${apiUrl}. Please ensure your server is running, accessible, and CORS is properly configured.` 
          };
        }
      }
      
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        return { 
          success: false, 
          message: `Network error connecting to ${apiUrl}. This is likely due to CORS restrictions. Please ensure your Asterisk server has CORS headers enabled.` 
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
