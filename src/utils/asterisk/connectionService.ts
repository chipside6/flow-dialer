
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/integrations/supabase/client';

interface AsteriskConfig {
  serverIp: string;
  username: string;
  password: string;
  port: string;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
}

export const connectionService = {
  async testConnection(config?: Partial<AsteriskConfig>): Promise<ConnectionTestResult> {
    try {
      console.log("Starting Asterisk connection test to server:", config?.serverIp || "192.168.0.197");
      
      // Get current session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Authentication error:", sessionError);
        return {
          success: false,
          message: "Authentication required: Please sign in",
          details: sessionError?.message
        };
      }
      
      // Make the request to the Supabase edge function
      const { data, error } = await supabase.functions.invoke("test-asterisk-connection", {
        body: config || {},
      });
      
      if (error) {
        console.error("Error invoking function:", error);
        return {
          success: false,
          message: `Error calling test function: ${error.message}`,
          details: JSON.stringify(error)
        };
      }
      
      return data as ConnectionTestResult;
    } catch (error) {
      console.error("Error in testConnection:", error);
      return {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        details: "Check the browser console for more details"
      };
    }
  },
  
  getConnectionInfo(): AsteriskConfig {
    return {
      serverIp: import.meta.env.VITE_ASTERISK_SERVER_IP || "192.168.0.197",
      username: "admin",
      password: "admin",
      port: "8088"
    };
  }
};
