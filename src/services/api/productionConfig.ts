
/**
 * Production API configuration
 * This file contains production environment settings
 */

// API base URL - should be set to your production API endpoint
export const PRODUCTION_API_URL = import.meta.env.VITE_API_URL || '';

// Maximum retry attempts for API calls
export const MAX_RETRY_ATTEMPTS = 3;

// Request timeout in milliseconds (15 seconds)
export const REQUEST_TIMEOUT = 15000;

// Enable detailed logging in production (should be false in production)
export const ENABLE_DETAILED_LOGGING = false;

// Rate limiting configuration
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000
};

// Session configuration
export const SESSION_CONFIG = {
  REFRESH_THRESHOLD: 300, // Refresh token 5 minutes before expiry
  MAX_SESSION_DURATION: 86400 // 24 hours
};

// Cache configuration
export const CACHE_CONFIG = {
  MAX_AGE: 3600, // 1 hour
  STALE_WHILE_REVALIDATE: 300 // 5 minutes
};
