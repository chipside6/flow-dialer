
import { getConfigFromStorage } from './config';

export const connectionService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Always use 192.168.0.197 as server IP
    const serverIp = "192.168.0.197";
    
    // Always use http://192.168.0.197:8088/ari/ as the API URL
    const apiUrl = `http://${serverIp}:8088/ari/`;
    
    // Always use admin/admin as credentials
    const username = "admin";
    const password = "admin";
    
    // Log connection details for debugging
    console.log(`Attempting to connect to Asterisk API at: ${apiUrl}`);
    console.log(`Using credentials: ${username}:****`);
    console.log(`Server IP: ${serverIp}`);
    
    try {
      // Try connecting with a longer timeout
      console.log('Sending authenticated request to:', `${apiUrl}applications`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Longer 10s timeout
      
      const apiEndpoint = `${apiUrl}applications`;
      console.log(`Final API endpoint: ${apiEndpoint}`);
      
      // Using fetch with credentials
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Explicitly request CORS
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
      
      // Handle different types of errors with better messages
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          message: `Connection to Asterisk timed out. Please verify the server is running and reachable at ${serverIp}.`
        };
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: `Browser cannot connect to ${serverIp}:8088. This is likely due to CORS restrictions or the server not being accessible from your browser. Try accessing http://${serverIp}:8088/ari/applications directly in your browser.` 
        };
      }
      
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
};
