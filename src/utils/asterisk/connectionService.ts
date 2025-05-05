
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Ensure we have the correct server IP - always use 192.168.0.197 as fallback
    const serverIp = config.serverIp || '192.168.0.197';
    
    // Make sure the URL has the proper format and uses the correct server IP
    let apiUrl = config.apiUrl;
    if (!apiUrl) {
      apiUrl = `http://${serverIp}:8088/ari/`;
      console.log(`Using default API URL: ${apiUrl}`);
    } else if (!apiUrl.startsWith('http')) {
      apiUrl = `http://${apiUrl}`;
      console.log(`Adding http:// prefix to API URL: ${apiUrl}`);
    }
    
    // Replace any old IP address references with the new one
    if (apiUrl.includes('10.0.2.15')) {
      apiUrl = apiUrl.replace('10.0.2.15', '192.168.0.197');
      console.log(`Replaced old IP with new IP in API URL: ${apiUrl}`);
    }
    
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
    console.log(`Server IP: ${serverIp}`);
    
    try {
      // Now try the actual authenticated request
      console.log('Sending authenticated request to:', `${apiUrl}applications`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Ensure proper endpoint format
      let apiEndpoint = apiUrl;
      if (!apiUrl.endsWith('/')) {
        if (!apiUrl.endsWith('applications')) {
          apiEndpoint = `${apiUrl}/applications`;
        }
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
          return { 
            success: false, 
            message: `Error connecting to Asterisk: ${response.statusText} (Status: ${response.status})` 
          };
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      
      // Handle timeout errors explicitly
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          message: `Connection to Asterisk timed out. Please verify the server is running and reachable at ${serverIp}.`
        };
      }
      
      // Improve error messages for common network errors
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          return { 
            success: false, 
            message: `Network connectivity error: Cannot connect to the Asterisk server at ${serverIp}. Please verify the server is running and accessible.` 
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
  }
};
