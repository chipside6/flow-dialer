
// Configuration values for Asterisk connection

// Get values directly from env variables for production
export const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || '';
export const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || '';
export const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || '';

/**
 * Helper function to create basic auth header
 */
export const createBasicAuthHeader = (username: string, password: string) => {
  return `Basic ${btoa(`${username}:${password}`)}`;
};

/**
 * Check if running in Lovable hosted environment
 */
export const isHostedEnvironment = (): boolean => {
  return window.location.hostname.includes('lovableproject.com');
};
