
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Use the config URL but also log all details for debugging
    const apiUrl = config.apiUrl;
    
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
      // Try with plain fetch and no credentials first to test basic connectivity
      console.log("Testing basic network connectivity to Asterisk server...");
      try {
        const networkTestResponse = await fetch(apiUrl, { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': '*/*'
          },
          // Very short timeout to quickly identify network issues
          signal: AbortSignal.timeout(3000)
        });
        
        console.log('Basic network test response:', networkTestResponse.status);
        if (networkTestResponse.status === 0) {
          return {
            success: false,
            message: 'Cannot reach Asterisk server. Please verify the server is running and accessible on the network.'
          };
        }
      } catch (networkError) {
        console.error('Network test error:', networkError);
        // Check for specific network error types
        if (networkError instanceof TypeError) {
          return {
            success: false,
            message: `Network connectivity error: ${networkError.message}. Please verify the Asterisk server IP address is correct and the server is running.`
          };
        }
      }
      
      // Now try the actual authenticated request
      console.log('Sending authenticated request to:', `${apiUrl}applications`);
      const response = await fetch(`${apiUrl}applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging on network issues
        signal: AbortSignal.timeout(5000)
      });
      
      console.log('Connection response status:', response.status);
      console.log('Connection response headers:', Object.fromEntries([...response.headers]));
      
      if (response.ok) {
        // Try to parse the response to validate it's proper JSON
        try {
          const data = await response.json();
          console.log('Connection successful, received data:', data);
          return { 
            success: true, 
            message: 'Successfully connected to Asterisk ARI' 
          };
        } catch (error) {
          console.log('Failed to parse JSON response:', error);
          return { 
            success: false, 
            message: `Connected to server but received invalid JSON. Check if this is actually an ARI endpoint.`
          };
        }
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
          console.log('Failed to parse error response, raw response:', error);
          let responseText = '';
          try {
            responseText = await response.text();
            console.log('Raw response text:', responseText);
          } catch (e) {
            console.log('Failed to get response text:', e);
          }
          
          return { 
            success: false, 
            message: `Error connecting to Asterisk: ${response.statusText} (Status: ${response.status})${responseText ? ` - Response: ${responseText}` : ''}`
          };
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      
      // Handle timeout errors explicitly
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          message: `Connection to Asterisk timed out. Please verify the server is running and reachable at ${config.serverIp || config.apiUrl}.`
        };
      }
      
      // Handle network errors better, especially CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: `Network error connecting to ${apiUrl}. This may be due to CORS restrictions or the Asterisk server being unavailable. Check server status and CORS configuration.` 
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
