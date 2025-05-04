
import { getConfigFromStorage } from './asterisk/config';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

export const asteriskService = {
  /**
   * Sync user configuration with Asterisk
   */
  syncConfiguration: async (userId: string, operation: 'reload' | 'sync_user' | 'sync_all' = 'sync_user'): Promise<{ 
    success: boolean; 
    message: string;
  }> => {
    try {
      console.log(`Syncing Asterisk configuration for user ${userId}, operation: ${operation}`);
      
      // Get the session
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (!accessToken) {
        console.error('No access token available');
        throw new Error('Authentication required');
      }
      
      // Get the Supabase URL from utility function
      const supabaseUrl = getSupabaseUrl();
      
      if (!supabaseUrl) {
        console.error('Could not determine Supabase URL');
        throw new Error('Could not determine Supabase URL');
      }
      
      // Get current Asterisk config
      const config = getConfigFromStorage();
      console.log('Using Asterisk config:', {
        apiUrl: config.apiUrl,
        serverIp: config.serverIp,
        username: config.username ? '[SET]' : '[NOT SET]'
      });
      
      // Make the request to the sync-goip-config edge function
      console.log(`Calling edge function at ${supabaseUrl}/functions/v1/sync-goip-config`);
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-goip-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          operation,
          serverIp: config.serverIp || '10.0.2.15' // Use local IP if not explicitly set
        })
      });
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw edge function response:', responseText);
      
      // Parse the JSON response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        return {
          success: false,
          message: `Error parsing response from server: ${responseText.substring(0, 100)}...`
        };
      }
      
      // Handle errors
      if (!response.ok) {
        console.error('Error response from sync-goip-config:', result);
        return {
          success: false,
          message: result?.message || result?.error || `Server returned error: ${response.status} ${response.statusText}`
        };
      }
      
      // Return the result
      return {
        success: result.success || false,
        message: result.message || 'Configuration synced successfully'
      };
    } catch (error) {
      console.error('Error in syncConfiguration:', error);
      return {
        success: false,
        message: error instanceof Error 
          ? `Error syncing configuration: ${error.message}` 
          : 'An unexpected error occurred while syncing configuration'
      };
    }
  },
  
  /**
   * Test connection to Asterisk server
   */
  testAsteriskConnection: async (serverIp?: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> => {
    try {
      console.log(`Testing Asterisk connection to server IP: ${serverIp || 'not specified'}`);
      
      // Get the Supabase URL from utility function
      const supabaseUrl = getSupabaseUrl();
      
      if (!supabaseUrl) {
        console.error('Could not determine Supabase URL');
        return {
          success: false,
          message: 'Could not determine Supabase URL'
        };
      }
      
      // Get the session
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (!accessToken) {
        console.error('No access token available');
        return {
          success: false,
          message: 'Authentication required'
        };
      }
      
      // Make the request to the check-asterisk-connection edge function
      console.log(`Calling edge function at ${supabaseUrl}/functions/v1/check-asterisk-connection`);
      const response = await fetch(`${supabaseUrl}/functions/v1/check-asterisk-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          serverIp: serverIp || '10.0.2.15' // Use local IP if not specified
        })
      });
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw edge function response:', responseText);
      
      // Parse the JSON response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        return {
          success: false,
          message: `Error parsing response from server: ${responseText.substring(0, 100)}...`
        };
      }
      
      // Return the result
      return {
        success: result.success || false,
        message: result.message || 'Connection test completed',
        details: result
      };
    } catch (error) {
      console.error('Error in testAsteriskConnection:', error);
      return {
        success: false,
        message: error instanceof Error 
          ? `Error testing connection: ${error.message}` 
          : 'An unexpected error occurred while testing connection'
      };
    }
  }
};

export default asteriskService;
