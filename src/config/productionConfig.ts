
/**
 * Production configuration
 * Central place for all production-specific settings
 */

// API and Backend Configuration
export const API_CONFIG = {
  // Base API URL for your backend services
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.yourapp.com/api',
  
  // Timeout for API requests in milliseconds (15 seconds)
  timeout: 15000,
  
  // Number of retry attempts for failed API calls
  maxRetries: 3
};

// Asterisk Configuration
export const ASTERISK_CONFIG = {
  // Asterisk API URL - do not include protocol by default, let user decide
  apiUrl: import.meta.env.VITE_ASTERISK_API_URL || '127.0.0.1:8088/ari',
  
  // Authentication credentials
  username: import.meta.env.VITE_ASTERISK_API_USERNAME || '',
  password: import.meta.env.VITE_ASTERISK_API_PASSWORD || '',
  
  // Maximum concurrent calls (production setting)
  maxConcurrentCalls: 50
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  // Public URL of your Supabase project (already configured in client.ts)
  url: import.meta.env.VITE_SUPABASE_URL || 'https://grhvoclalziyjbjlhpml.supabase.co',
  
  // Anon key (already configured in client.ts)
  publicKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-key-here'
};

// Feature Flags for Production
export const FEATURE_FLAGS = {
  // Enable experimental features in production
  enableExperimentalFeatures: false,
  
  // Enable detailed logging in production
  enableDetailedLogging: false,
  
  // Show debugging tools in UI
  showDebugTools: false
};

// Error Reporting Configuration
export const ERROR_REPORTING = {
  // Whether to report errors to external service
  enabled: true,
  
  // Minimum error level to report
  minLevel: 'error', // 'debug' | 'info' | 'warn' | 'error'
  
  // Whether to include user context in error reports
  includeUserContext: true
};
