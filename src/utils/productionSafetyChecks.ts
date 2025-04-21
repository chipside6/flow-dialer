
import { supabase } from '@/integrations/supabase/client';
import { SESSION_CONFIG } from '@/services/api/productionConfig';

/**
 * Production safety checks and utilities
 */
export const productionSafetyChecks = {
  /**
   * Verify all required configurations are present
   */
  verifyConfigurations: async () => {
    const missingConfigs: string[] = [];
    
    // Check Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) missingConfigs.push('Supabase Configuration');
    } catch {
      missingConfigs.push('Supabase Connection');
    }
    
    // Check API configuration
    if (!import.meta.env.VITE_API_URL) {
      missingConfigs.push('API URL Configuration');
    }
    
    // Check Asterisk configuration
    if (!import.meta.env.VITE_ASTERISK_API_URL) {
      missingConfigs.push('Asterisk API Configuration');
    }
    
    return {
      isValid: missingConfigs.length === 0,
      missingConfigs
    };
  },
  
  /**
   * Session management safety checks
   */
  verifySession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const expiresAt = new Date(session.expires_at || 0).getTime();
    const now = Date.now();
    
    // Check if session is close to expiry
    if (expiresAt - now < SESSION_CONFIG.REFRESH_THRESHOLD * 1000) {
      await supabase.auth.refreshSession();
    }
    
    return true;
  },
  
  /**
   * Run all production safety checks
   */
  runAllChecks: async () => {
    const results = await Promise.all([
      productionSafetyChecks.verifyConfigurations(),
      productionSafetyChecks.verifySession()
    ]);
    
    return {
      isReady: results.every(result => 
        typeof result === 'boolean' ? result : result.isValid
      ),
      checks: results
    };
  }
};
