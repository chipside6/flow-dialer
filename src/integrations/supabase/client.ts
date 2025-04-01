
import { createClient } from '@supabase/supabase-js';

// Try to add logs to see if this file is loaded
console.log('🔍 Supabase client initialization - START');

// Define fallback values for development
const FALLBACK_URL = 'https://grhvoclalziyjbjlhpml.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyaHZvY2xhbHppeWpiamxocG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDY0NTUsImV4cCI6MjA1NzcyMjQ1NX0.cMxyK-VaP3gO5MwbPujoNj7dq6iPHdNBQ6a5kvvgPYA';

// Get environment variables or use fallbacks with detailed logging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

console.log('🔍 Supabase URL available:', !!supabaseUrl, 'Using URL:', supabaseUrl);
console.log('🔍 Supabase Anon Key available:', !!supabaseAnonKey, 'Key length:', supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🔍 WARNING: Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment for proper configuration.');
}

// Create Supabase client with explicit error handling
try {
  // Create Supabase client with explicit error handling
  console.log('🔍 Creating Supabase client with URL:', supabaseUrl);
  
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
  if (supabase && supabase.auth) {
    console.log('🔍 Supabase client looks valid');
  } else {
    console.error('🔍 Supabase client may be invalid - missing properties');
  }
} catch (error) {
  console.error('🔍 Critical error creating Supabase client:', error);
  
  // Create a dummy client to prevent application crashes
  // This allows the app to load, but Supabase functionality won't work
  export const supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null })
    }),
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
  
  // Throw a more detailed error after setting up the dummy client
  throw new Error(`Failed to initialize Supabase client: ${error.message}. The application will load but database features won't work.`);
}

console.log('🔍 Supabase client initialization - COMPLETE');
