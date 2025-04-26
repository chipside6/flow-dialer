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
      // Try a more basic way to connect to avoid CORS issues
      console.log("Attempting simple fetch request to test connectivity...");
      
      // First try a no-auth request to check if server is reachable at all
      try {
        const pingResponse = await fetch(`${apiUrl}ping`, { 
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': '*/*'
          }
        });
        console.log('Initial ping response:', pingResponse.status);
      } catch (e) {
        console.log('Ping failed, will still try authenticated request:', e);
      }
      
      // Attempt the actual connection with auth
      const response = await fetch(`${apiUrl}applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
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
      
      // Handle network errors better, especially CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: `Network error connecting to ${apiUrl}. This is likely due to CORS restrictions. Please follow the CORS configuration instructions below.` 
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
