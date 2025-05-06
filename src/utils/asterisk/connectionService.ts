
import { getConfigFromStorage } from './config';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';

export const connectionService = {
  /**
   * Test connection to Asterisk server via Supabase Edge Function
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const config = getConfigFromStorage();
    
    // Log connection details for debugging
    console.log(`Attempting to connect to Asterisk API at: ${config.apiUrl}`);
    console.log(`Using credentials: ${config.username}:****`);
    console.log(`Server IP: ${config.serverIp}`);
    
    try {
      console.log('Using Supabase Edge Function to test connection');
      
      // Get the Supabase URL
      const supabaseUrl = getSupabaseUrl();
      if (!supabaseUrl) {
        console.error('Could not determine Supabase URL');
        return { 
          success: false, 
          message: 'Could not determine Supabase URL' 
        };
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("test-asterisk-connection", {
        method: 'GET'
      });
      
      console.log('Edge function response:', data, error);
      
      if (error) {
        console.error('Edge function error:', error);
        return { 
          success: false, 
          message: `Error calling Edge Function: ${error.message}` 
        };
      }
      
      // The Edge Function should return { success: boolean, message: string }
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Connection error:', error);
      
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
};
