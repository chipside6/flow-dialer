
/**
 * Production API configuration
 * This file contains production environment settings
 */

// API base URL - should be set to your production API endpoint
// Set to empty string by default to avoid connection errors
export const PRODUCTION_API_URL = import.meta.env.VITE_API_URL || '';

// Maximum retry attempts for API calls
export const MAX_RETRY_ATTEMPTS = 3;

// Request timeout in milliseconds (15 seconds)
export const REQUEST_TIMEOUT = 15000;

// Enable detailed logging in production (consider setting to false for production)
export const ENABLE_DETAILED_LOGGING = false;
