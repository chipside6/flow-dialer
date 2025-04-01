
import { createClient } from '@supabase/supabase-js';

// Try to add logs to see if this file is loaded
console.log('🔍 Supabase client initialization - START');

// Get environment variables or use fallbacks with detailed logging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase URL available:', !!supabaseUrl);
console.log('🔍 Supabase Anon Key available:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🔍 ERROR: Missing Supabase credentials. Please check your environment variables.');
}

// Create Supabase client with explicit error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

console.log('🔍 Supabase client created successfully');

// Verify the client was created with a simple check
try {
  // Simple check to see if the client has the expected properties
  if (supabase && supabase.auth) {
    console.log('🔍 Supabase client looks valid');
  } else {
    console.error('🔍 Supabase client may be invalid - missing properties');
  }
} catch (error) {
  console.error('🔍 Error verifying Supabase client:', error);
}

console.log('🔍 Supabase client initialization - COMPLETE');
