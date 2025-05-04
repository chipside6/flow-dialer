
/**
 * Asterisk API configuration utilities
 */

// Default values using the detected server IP
export const ASTERISK_SERVER_IP = '192.168.0.197'; // Your detected server IP
export const ASTERISK_API_URL = `http://${ASTERISK_SERVER_IP}:8088/ari/`;
export const ASTERISK_API_USERNAME = 'admin';
export const ASTERISK_API_PASSWORD = 'admin';

// Storage key
const STORAGE_KEY = 'asterisk_config';

// Config interface
export interface AsteriskConfig {
  apiUrl: string;
  username: string;
  password: string;
  serverIp?: string;
}

/**
 * Get configuration from localStorage
 */
export const getConfigFromStorage = (): AsteriskConfig => {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY);
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      
      // Make sure we have the server IP from the API URL if it's not explicitly set
      if (!parsedConfig.serverIp && parsedConfig.apiUrl) {
        try {
          const url = new URL(parsedConfig.apiUrl);
          parsedConfig.serverIp = url.hostname;
        } catch (e) {
          console.warn('Could not parse server IP from API URL:', e);
          // Use detected server IP as fallback
          parsedConfig.serverIp = ASTERISK_SERVER_IP;
        }
      }
      
      console.log('Loaded Asterisk config from storage:', { 
        apiUrl: parsedConfig.apiUrl, 
        username: parsedConfig.username, 
        password: parsedConfig.password ? '******' : 'not set',
        serverIp: parsedConfig.serverIp
      });
      
      return parsedConfig;
    }
  } catch (error) {
    console.error('Error reading Asterisk configuration from localStorage:', error);
  }
  
  // Return defaults using detected server IP if nothing is stored
  const defaultConfig = {
    apiUrl: ASTERISK_API_URL,
    username: ASTERISK_API_USERNAME,
    password: ASTERISK_API_PASSWORD,
    serverIp: ASTERISK_SERVER_IP
  };
  
  console.log('Using default Asterisk config with detected server IP:', { 
    apiUrl: defaultConfig.apiUrl, 
    username: defaultConfig.username, 
    password: defaultConfig.password ? '******' : 'not set',
    serverIp: defaultConfig.serverIp
  });
  
  return defaultConfig;
};

/**
 * Save configuration to localStorage
 */
export const saveConfigToStorage = (config: AsteriskConfig): void => {
  console.log('Saving config:', {
    apiUrl: config.apiUrl,
    username: config.username,
    hasPassword: !!config.password,
    serverIp: config.serverIp
  });

  try {
    // Ensure username is set
    if (!config.username) {
      config.username = 'admin';
      console.log('Setting default username:', config.username);
    }
    
    // Ensure password is set
    if (!config.password) {
      config.password = 'admin';
      console.log('Setting default password: *****');
    }
    
    // Extract server IP from API URL if not explicitly set
    if (!config.serverIp && config.apiUrl) {
      try {
        const url = new URL(config.apiUrl);
        config.serverIp = url.hostname;
        console.log('Extracted server IP from API URL:', config.serverIp);
      } catch (e) {
        console.warn('Could not parse server IP from API URL:', e);
        config.serverIp = '10.0.2.15'; // Default fallback
      }
    }

    // Save the configuration to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    console.log('Successfully saved Asterisk config to storage');
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
  
  console.log(`Testing connection to Asterisk API at: ${config.apiUrl}`);
  
  try {
    const response = await fetch(`${config.apiUrl}applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      // Save working config back to storage
      saveConfigToStorage({
        ...config
      });
      
      return { 
        success: true, 
        message: 'Successfully connected to Asterisk ARI' 
      };
    } else {
      try {
        const errorData = await response.json();
        return { 
          success: false, 
          message: `Error connecting to Asterisk: ${errorData.message || response.statusText}` 
        };
      } catch (error) {
        // If we can't parse JSON, return the status text
        return { 
          success: false, 
          message: `Error connecting to Asterisk: ${response.statusText}` 
        };
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        message: `Connection to Asterisk timed out after 5 seconds. Please verify the server is running.`
      };
    }
    
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
  return !!config.apiUrl && !!config.username && !!config.password;
};

/**
 * Check if running in a hosted environment
 */
export const isHostedEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};
