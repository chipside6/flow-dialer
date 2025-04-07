
// Configuration values for Asterisk connection

// Get values directly from env variables for production
export const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || '';
export const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || '';
export const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || '';
export const ASTERISK_SERVER_IP = import.meta.env.VITE_ASTERISK_SERVER_IP || ''; 

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

/**
 * Check if environment variables are set
 * This handles both direct env vars and Supabase-stored configuration
 */
export const hasConfiguredEnvironment = (): boolean => {
  // In hosted environments, we always return true since config can be set via the UI
  if (isHostedEnvironment()) {
    return true;
  }
  
  // For local development, check if environment variables are set
  return Boolean(ASTERISK_API_URL && ASTERISK_API_USERNAME && ASTERISK_API_PASSWORD);
};

/**
 * Get environment variables from localStorage if in hosted environment
 * This allows users to set config via the UI that persists across sessions
 */
export const getConfigFromStorage = () => {
  if (!isHostedEnvironment()) {
    return {
      apiUrl: ASTERISK_API_URL,
      username: ASTERISK_API_USERNAME,
      password: ASTERISK_API_PASSWORD,
      serverIp: ASTERISK_SERVER_IP
    };
  }
  
  try {
    const savedApiUrl = localStorage.getItem('asterisk_api_url') || ASTERISK_API_URL;
    const savedUsername = localStorage.getItem('asterisk_username') || ASTERISK_API_USERNAME;
    const savedPassword = localStorage.getItem('asterisk_password') || ASTERISK_API_PASSWORD;
    const savedServerIp = localStorage.getItem('asterisk_server_ip') || ASTERISK_SERVER_IP;
    
    return {
      apiUrl: savedApiUrl,
      username: savedUsername,
      password: savedPassword,
      serverIp: savedServerIp
    };
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return {
      apiUrl: ASTERISK_API_URL,
      username: ASTERISK_API_USERNAME,
      password: ASTERISK_API_PASSWORD,
      serverIp: ASTERISK_SERVER_IP
    };
  }
};

/**
 * Save environment variables to localStorage in hosted environment
 */
export const saveConfigToStorage = (apiUrl: string, username: string, password: string, serverIp: string = ''): void => {
  if (!isHostedEnvironment()) {
    console.log('Not in hosted environment, skipping storage of configuration');
    return;
  }
  
  try {
    localStorage.setItem('asterisk_api_url', apiUrl);
    localStorage.setItem('asterisk_username', username);
    localStorage.setItem('asterisk_password', password);
    if (serverIp) {
      localStorage.setItem('asterisk_server_ip', serverIp);
    }
    console.log('Saved Asterisk configuration to localStorage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};
