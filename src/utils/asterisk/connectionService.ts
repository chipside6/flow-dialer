
import { getConfigFromStorage } from './config';

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
}

export const connectionService = {
  async testConnection(): Promise<ConnectionTestResult> {
    const config = getConfigFromStorage();
    
    try {
      console.log("Testing connection to Asterisk server at:", config.serverIp);
      
      // Make API request to test connection
      const response = await fetch(`${config.apiUrl}applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If the response is successful, return success
      if (response.ok) {
        return {
          success: true,
          message: `Successfully connected to Asterisk server at ${config.serverIp}`,
          details: "API endpoint is accessible and credentials are valid"
        };
      } else {
        // If the response is not successful, return error details
        return {
          success: false,
          message: `Failed to connect to Asterisk server: ${response.statusText}`,
          details: `HTTP Status: ${response.status} - ${response.statusText}`
        };
      }
    } catch (error) {
      console.error("Error testing Asterisk connection:", error);
      
      // Check for common connection errors
      let errorMessage = "Connection failed";
      let errorDetails = error instanceof Error ? error.message : String(error);
      
      // Check for CORS errors
      if (errorDetails.includes("CORS") || 
          errorDetails.includes("NetworkError") || 
          errorDetails.includes("Failed to fetch")) {
        errorMessage = "CORS or network error - Check server configuration";
        errorDetails = "Your browser may be blocked from accessing the Asterisk server due to CORS policy restrictions. Make sure CORS is properly configured on your Asterisk server.";
      }
      
      return {
        success: false,
        message: errorMessage,
        details: errorDetails
      };
    }
  }
};
