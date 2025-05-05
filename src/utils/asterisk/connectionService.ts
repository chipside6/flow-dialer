
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Use the config URL but also log all details for debugging
    let apiUrl = config.apiUrl;
    
    // Make sure the URL has the proper format
    if (apiUrl && !apiUrl.startsWith('http')) {
      apiUrl = `http://${apiUrl}`;
      console.log(`Adding http:// prefix to API URL: ${apiUrl}`);
    }
    
    // Validate configuration
    if (!config.username || !config.password) {
      return { 
        success: false, 
        message: 'Username or password is not configured. Please configure your Asterisk server settings.' 
      };
    }
    
    if (!apiUrl) {
      return {
        success: false,
        message: 'Asterisk server URL is not configured. Please enter a valid API URL.'
      };
    }
    
    // Check if using the detected local IP address
    const isLocalServerIP = apiUrl.includes('192.168.0.197');
    if (isLocalServerIP) {
      console.log("Detected local server IP 192.168.0.197 - using optimized parameters");
      
      // Force using correct port for local server
      if (!apiUrl.includes(':8088')) {
        if (apiUrl.endsWith('/')) {
          apiUrl = `http://192.168.0.197:8088/`;
        } else {
          apiUrl = `http://192.168.0.197:8088/ari/`;
        }
        console.log(`Using optimized local API URL: ${apiUrl}`);
      }
    }
    
    // Log the URL we're connecting to
    console.log(`Attempting to connect to Asterisk API at: ${apiUrl}`);
    console.log(`Using credentials: ${config.username}:****`);
    
    try {
      // First try a simple network connectivity test
      console.log("Testing basic network connectivity...");
      
      try {
        // Use fetch with a short timeout just to test basic connectivity
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const testUrl = new URL(apiUrl);
        const networkTestUrl = `${testUrl.protocol}//${testUrl.host}/`;
        
        console.log(`Testing connection to base URL: ${networkTestUrl}`);
        const networkTestResponse = await fetch(networkTestUrl, { 
          method: 'HEAD',
          mode: 'no-cors', // This prevents CORS issues during the test
          cache: 'no-cache',
          signal: controller.signal
        }).catch(e => {
          console.error("Network test fetch error:", e);
          throw new Error(`Network connectivity error: Cannot reach the server at ${testUrl.host}. Please verify the server is running and accessible.`);
        });
        
        clearTimeout(timeoutId);
        console.log(`Network connectivity test response:`, networkTestResponse);
      } catch (networkError) {
        // Special handling for local IP
        if (isLocalServerIP) {
          console.log("Local server network test failed, but continuing with API test as this may be expected in local environment");
        } else {
          // If we can't even reach the server, return a helpful error message
          console.error('Network connectivity test failed:', networkError);
          return {
            success: false,
            message: networkError instanceof Error 
              ? networkError.message
              : `Network connectivity error: Cannot reach the Asterisk server. Please verify the server IP address is correct and the server is running.`
          };
        }
      }
      
      // Now try the actual authenticated request
      console.log('Sending authenticated request to:', `${apiUrl}applications`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // For local server (192.168.0.197), use applications endpoint if not specified
      let apiEndpoint = apiUrl;
      if (isLocalServerIP && !apiUrl.endsWith('/')) {
        if (!apiUrl.endsWith('applications')) {
          apiEndpoint = `${apiUrl}applications`;
        }
      } else if (!apiUrl.endsWith('/')) {
        apiEndpoint = `${apiUrl}/applications`;
      } else {
        apiEndpoint = `${apiUrl}applications`;
      }
      
      console.log(`Final API endpoint: ${apiEndpoint}`);
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Connection response status:', response.status);
      
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
          console.log('Failed to parse error response:', error);
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
          message: `Connection to Asterisk timed out. Please verify the server is running and reachable at ${config.serverIp || new URL(apiUrl).hostname}.`
        };
      }
      
      // Improve error messages for common network errors
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          return { 
            success: false, 
            message: `Network connectivity error: Cannot connect to the Asterisk server. Please verify the server IP address is correct and the server is running.` 
          };
        }
        
        if (error.message.includes('Invalid URL')) {
          return {
            success: false,
            message: `Invalid Asterisk server URL: "${apiUrl}". Please check the URL format and try again.`
          };
        }
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
