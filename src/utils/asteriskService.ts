
import { getConfigFromStorage } from './asterisk/config';
import { supabase } from '@/integrations/supabase/client';

export const asteriskService = {
  /**
   * Test connection to Asterisk server
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    try {
      // Try to connect to the Asterisk API
      const response = await fetch(`${config.apiUrl}/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        }
      });
      
      if (response.ok) {
        return { 
          success: true, 
          message: 'Successfully connected to Asterisk ARI' 
        };
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            message: `Error connecting to Asterisk: ${errorData.message || response.statusText}` 
          };
        } catch (e) {
          return {
            success: false,
            message: `Error connecting to Asterisk: ${response.statusText}`
          };
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  /**
   * Get status of a GoIP port
   */
  checkGoipStatus: async (userId: string, portNumber: number = 1): Promise<{ online: boolean; message: string; lastSeen?: string }> => {
    try {
      // Get session for authentication
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Call the edge function to check GoIP status
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/goip-asterisk-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          userId,
          action: 'check_status'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error checking GoIP status: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error checking GoIP status');
      }
      
      // Find the status for the specific port
      const portStatus = result.statuses?.find((s: any) => s.port === portNumber);
      
      if (!portStatus) {
        return {
          online: false,
          message: `No information available for port ${portNumber}`
        };
      }
      
      return {
        online: portStatus.status === 'registered',
        message: portStatus.status === 'registered' 
          ? `Port ${portNumber} is online and registered` 
          : `Port ${portNumber} is offline or not registered`,
        lastSeen: portStatus.lastSeen
      };
    } catch (error) {
      console.error('Error checking GoIP status:', error);
      return {
        online: false,
        message: error instanceof Error ? error.message : 'Unknown error checking GoIP status'
      };
    }
  },
  
  /**
   * Sync GoIP configuration with Asterisk server
   */
  syncConfiguration: async (userId: string, operation: 'reload' | 'sync_user' | 'sync_all' = 'sync_user'): Promise<{ success: boolean; message: string }> => {
    try {
      // Get session for authentication
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Call the edge function to sync configuration
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          userId,
          operation
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error syncing configuration: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: result.success || false,
        message: result.message || 'Configuration synced successfully'
      };
    } catch (error) {
      console.error('Error syncing configuration:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error syncing configuration'
      };
    }
  }
};
