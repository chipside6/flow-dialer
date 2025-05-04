
import { getConfigFromStorage } from './asterisk/config';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { connectionService } from './asterisk/connectionService';
import { logger } from './utils/logger';  // Import a logging utility

export const asteriskService = {
  /**
   * Sync user configuration with Asterisk
   */
  syncConfiguration: async (userId: string, operation: 'reload' | 'sync_user' | 'sync_all' = 'sync_user'): Promise<{ success: boolean; message: string }> => {
    try {
      logger.info(`Syncing Asterisk configuration for user ${userId}, operation: ${operation}`);
      
      // Get the session
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (!accessToken) {
        logger.error('No access token available');
        throw new Error('Authentication required');
      }
      
      // Get the Supabase URL
      const supabaseUrl = getSupabaseUrl();
      if (!supabaseUrl) {
        logger.error('Could not determine Supabase URL');
        throw new Error('Could not determine Supabase URL');
      }
      
      // Get current Asterisk config
      const config = getConfigFromStorage();
      logger.info('Using Asterisk config', { apiUrl: config.apiUrl, serverIp: config.serverIp });
      
      // Make the request to the sync-goip-config edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-goip-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          operation,
          serverIp: config.serverIp || '192.168.0.197' // Default IP if not set
        })
      });
      
      const responseText = await response.text();
      logger.info('Raw edge function response:', responseText);
      
      // Parse the JSON response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        logger.error('Error parsing response:', e);
        return {
          success: false,
          message: `Error parsing response from server: ${responseText.substring(0, 100)}...`
        };
      }
      
      // Handle errors
      if (!response.ok) {
        logger.error('Error response from sync-goip-config:', result);
        return {
          success: false,
          message: result?.message || result?.error || `Error: ${response.status} ${response.statusText}`
        };
      }
      
      return {
        success: result.success || false,
        message: result.message || 'Configuration synced successfully'
      };
    } catch (error) {
      logger.error('Error in syncConfiguration:', error);
      return {
        success: false,
        message: error instanceof Error ? `Error syncing configuration: ${error.message}` : 'Unexpected error while syncing configuration'
      };
    }
  },
  
  /**
   * Test connection to Asterisk server
   */
  testAsteriskConnection: async (serverIp?: string): Promise<{ success: boolean; message: string; details?: any }> => {
    try {
      logger.info(`Testing Asterisk connection to server IP: ${serverIp || 'not specified'}`);
      
      const supabaseUrl = getSupabaseUrl();
      if (!supabaseUrl) {
        logger.error('Could not determine Supabase URL');
        return { success: false, message: 'Could not determine Supabase URL' };
      }
      
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (!accessToken) {
        logger.error('No access token available');
        return { success: false, message: 'Authentication required' };
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/check-asterisk-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ serverIp: serverIp || '192.168.0.197' })
      });
      
      const responseText = await response.text();
      logger.info('Raw edge function response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        logger.error('Error parsing response:', e);
        return { success: false, message: `Error parsing response from server: ${responseText.substring(0, 100)}...` };
      }
      
      return { success: result.success || false, message: result.message || 'Connection test completed', details: result };
    } catch (error) {
      logger.error('Error in testAsteriskConnection:', error);
      return { success: false, message: error instanceof Error ? `Error testing connection: ${error.message}` : 'Unexpected error while testing connection' };
    }
  },
  
  /**
   * Check GoIP device status
   */
  checkGoipStatus: async (userId: string, portNumber: number = 1): Promise<{ online: boolean; message: string; lastSeen?: string | null }> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Authentication required');
      }
      
      const supabaseUrl = getSupabaseUrl();
      const response = await fetch(`${supabaseUrl}/functions/v1/goip-asterisk-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({ userId, action: 'check_status', portNumber })
      });
      
      if (!response.ok) {
        throw new Error(`Error checking GoIP status: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error checking GoIP status');
      }
      
      const portStatus = result.statuses?.find((s: any) => s.port === portNumber);
      if (!portStatus) {
        return { online: false, message: `No information available for port ${portNumber}` };
      }
      
      return {
        online: portStatus.status === 'registered',
        message: portStatus.status === 'registered' ? `Port ${portNumber} is online and registered` : `Port ${portNumber} is offline or not registered`,
        lastSeen: portStatus.lastSeen
      };
    } catch (error) {
      logger.error('Error checking GoIP status:', error);
      return { online: false, message: error instanceof Error ? error.message : 'Unknown error checking GoIP status' };
    }
  }
};

export default asteriskService;
