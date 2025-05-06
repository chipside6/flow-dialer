
export const ASTERISK_SERVER_IP = "192.168.0.197";

export interface AsteriskConfig {
  apiUrl: string;
  username: string;
  password: string;
  serverIp: string;
}

// Storage key for Asterisk configuration
const STORAGE_KEY = "asterisk_config";

// Get configuration from localStorage
export const getConfigFromStorage = (): AsteriskConfig => {
  // Always return fixed values for now
  return {
    apiUrl: `http://${ASTERISK_SERVER_IP}:8088/ari/`,
    username: 'admin',
    password: 'admin',
    serverIp: ASTERISK_SERVER_IP
  };
};

// Save configuration to localStorage
export const saveConfigToStorage = (config: AsteriskConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving Asterisk config to localStorage:", error);
  }
};
