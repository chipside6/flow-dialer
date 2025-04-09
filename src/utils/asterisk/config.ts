
/**
 * Asterisk API configuration utilities
 */

// Default values - these will be overridden by localStorage if available
export const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || 'http://localhost:8088/ari';
export const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || 'admin';
export const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || 'admin';

// Storage key
const STORAGE_KEY = 'asterisk_config';

// Config interface
export interface AsteriskConfig {
  apiUrl: string;
  username: string;
  password: string;
}

/**
 * Get configuration from localStorage
 */
export const getConfigFromStorage = (): AsteriskConfig => {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY);
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
  } catch (error) {
    console.error('Error reading Asterisk configuration from localStorage:', error);
  }
  
  // Return defaults if nothing is stored
  return {
    apiUrl: ASTERISK_API_URL,
    username: ASTERISK_API_USERNAME,
    password: ASTERISK_API_PASSWORD
  };
};

/**
 * Save configuration to localStorage
 */
export const saveConfigToStorage = (config: AsteriskConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving Asterisk configuration to localStorage:', error);
  }
};

/**
 * Clear configuration from localStorage
 */
export const clearConfigFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing Asterisk configuration from localStorage:', error);
  }
};

/**
 * Test if the current configuration can connect to Asterisk
 */
export const testAsteriskConnection = async (): Promise<{ success: boolean; message: string }> => {
  const config = getConfigFromStorage();
  
  try {
    const response = await fetch(`${config.apiUrl}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
      }
    });
    
    if (response.ok) {
      return { 
        success: true, 
        message: 'Successfully connected to Asterisk ARI' 
      };
    } else {
      const errorData = await response.json();
      return { 
        success: false, 
        message: `Error connecting to Asterisk: ${errorData.message || response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error connecting to Asterisk: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Create Basic Auth header value
 */
export const createBasicAuthHeader = (username: string, password: string): string => {
  return `Basic ${btoa(`${username}:${password}`)}`;
};

/**
 * Check if the environment has been configured
 */
export const hasConfiguredEnvironment = (): boolean => {
  const config = getConfigFromStorage();
  return !!(config.apiUrl && config.username && config.password);
};

/**
 * Check if running in a hosted environment
 */
export const isHostedEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};
