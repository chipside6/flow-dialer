
import { supabase } from '@/integrations/supabase/client';

/**
 * Generator for Asterisk API integration
 */
export const apiGenerator = {
  /**
   * Generate API configuration for Asterisk
   */
  generateApiConfig: async (userId: string): Promise<{ success: boolean; message: string; config?: string }> => {
    try {
      // Validate userId
      if (!userId) {
        throw new Error('Missing required parameter: userId');
      }

      // Get user's configuration from database
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Error fetching user settings: ${error.message}`);
      }

      // Generate API configuration
      const apiConfig = `
; Asterisk API configuration for user ${userId}
; Generated on ${new Date().toISOString()}

[asterisk_api]
enabled = yes
port = 8088
bindaddr = 0.0.0.0
prefix = /ari
pretty = yes

[general]
allowed_origins = *
      `.trim();

      return {
        success: true,
        message: "API configuration generated successfully",
        config: apiConfig
      };
    } catch (error) {
      console.error("Error generating API configuration:", error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error generating API configuration"
      };
    }
  }
};
