
import { createClient } from '@supabase/supabase-js';

// Try to add logs to see if this file is loaded
console.log('🔍 Supabase client initialization');

// Get environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase URL available:', !!supabaseUrl);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('🔍 Supabase client created');

// Optional: Check if the client was created correctly
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('🔍 Missing Supabase URL or Anonymous Key');
  }
} catch (error) {
  console.error('🔍 Error initializing Supabase client:', error);
}
