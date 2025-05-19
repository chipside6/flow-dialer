
import { getConfigFromStorage } from './asterisk/config';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

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
      
      // Get current Asterisk config
      const config = getConfigFromStorage();
      logger.info('Using Asterisk config', { serverIp: config.serverIp });
      
      // Make the request to the sync-goip-config edge function
      const { data, error } = await supabase.functions.invoke("sync-goip-config", {
        body: {
          userId,
          operation,
          serverIp: config.serverIp || '192.168.0.197'
        }
      });
      
      if (error) {
        logger.error('Error in syncConfiguration:', error);
        return {
          success: false,
          message: error.message || 'Unknown error syncing configuration'
        };
      }
      
      return {
        success: data.success || false,
        message: data.message || 'Configuration synced successfully'
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
  testAsteriskConnection: async (serverIp?: string): Promise<{ success: boolean; message: string; details?: string }> => {
    try {
      logger.info(`Testing Asterisk connection to server IP: ${serverIp || 'not specified'}`);
      
      const config = getConfigFromStorage();
      
      // Make the request to the check-asterisk-connection edge function
      const { data, error } = await supabase.functions.invoke("check-asterisk-connection", {
        body: { 
          serverIp: serverIp || config.serverIp || '192.168.0.197',
          apiUrl: config.apiUrl,
          username: config.username,
          password: config.password
        }
      });
      
      if (error) {
        logger.error('Error in testAsteriskConnection:', error);
        return { 
          success: false, 
          message: error.message || 'Error testing connection',
          details: typeof error === 'string' ? error : JSON.stringify(error)
        };
      }
      
      // Ensure we're always returning strings for details
      const result = {
        success: data.success || false,
        message: data.message || 'Connection test completed',
        details: typeof data.details === 'string' ? data.details : 
                (data.details ? JSON.stringify(data.details) : undefined)
      };
      
      return result;
    } catch (error) {
      logger.error('Error in testAsteriskConnection:', error);
      return { 
        success: false, 
        message: error instanceof Error ? `Error testing connection: ${error.message}` : 'Unexpected error while testing connection',
        details: "Check console logs for more information"
      };
    }
  },
  
  /**
   * Check GoIP device status
   */
  checkGoipStatus: async (userId: string, portNumber: number = 1): Promise<{ online: boolean; message: string; lastSeen?: string | null }> => {
    try {
      // Make the request to the goip-asterisk-integration edge function
      const { data, error } = await supabase.functions.invoke("goip-asterisk-integration", {
        body: { 
          userId, 
          action: 'check_status', 
          portNumber 
        }
      });
      
      if (error) {
        logger.error('Error checking GoIP status:', error);
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error checking GoIP status');
      }
      
      const portStatus = data.statuses?.find((s: any) => s.port === portNumber);
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
