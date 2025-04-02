// This file is kept for backward compatibility purposes only.
// The application now uses Supabase exclusively for backend services.
// Imports of this file will work but actual API usage is deprecated.

import { supabase } from "@/integrations/supabase/client";

// Use the configured Supabase URL
export const API_URL = import.meta.env.VITE_SUPABASE_URL || '';

// Log configuration on startup (only in development)
if (import.meta.env.DEV) {
  console.log(`[API] Using Supabase URL: ${API_URL}`);
}

/**
 * Helper function to add auth headers to requests
 * @deprecated Use supabase client directly
 */
export const getAuthHeaders = (): Record<string, string> => {
  console.warn('getAuthHeaders is deprecated. Use the Supabase client directly.');
  return {};
};

/**
 * @deprecated Use supabase client directly
 */
export const apiFetch = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  console.warn('apiFetch is deprecated. Use the Supabase client directly.');
  
  // Simple mapping for backward compatibility
  // This should handle basic fetch operations until they can be properly migrated
  try {
    console.log(`[API] Redirecting call to Supabase: ${endpoint}`);
    
    // This is a very simple fallback that might not work for all endpoints
    // It's intended to keep basic functionality until proper migration
    if (endpoint.includes('contact-lists')) {
      const { data, error } = await supabase.from('contact_lists').select('*');
      if (error) throw error;
      return data as unknown as T;
    } else if (endpoint.includes('campaigns')) {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (error) throw error;
      return data as unknown as T;
    } else if (endpoint.includes('transfer-numbers')) {
      const { data, error } = await supabase.from('transfer_numbers').select('*');
      if (error) throw error;
      return data as unknown as T;
    } else if (endpoint.includes('sip-providers')) {
      const { data, error } = await supabase.from('sip_providers').select('*');
      if (error) throw error;
      return data as unknown as T;
    } else if (endpoint.includes('greeting-files')) {
      const { data, error } = await supabase.from('greeting_files').select('*');
      if (error) throw error;
      return data as unknown as T;
    }
    
    throw new Error(`Endpoint not implemented in Supabase migration: ${endpoint}`);
  } catch (error) {
    console.error(`[API] Error in Supabase migration:`, error);
    throw error;
  }
};
