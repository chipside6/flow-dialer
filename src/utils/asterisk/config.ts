
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

// Helper function for the readiness checker
export const isHostedEnvironment = (): boolean => {
  // Determine if the system is running in a hosted environment
  // For now, always return true
  return true;
};

// Check if Asterisk environment is configured
export const hasConfiguredEnvironment = (): boolean => {
  try {
    const config = getConfigFromStorage();
    return !!(config.apiUrl && config.username && config.password);
  } catch (error) {
    console.error("Error checking configuration:", error);
    return false;
  }
};

// Test connection to Asterisk server
export const testAsteriskConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Import asteriskService instead of importing it directly to avoid circular dependencies
    const { asteriskService } = await import('@/utils/asteriskService');
    
    // Use the service to test the connection
    const result = await asteriskService.testAsteriskConnection();
    return { 
      success: result.success,
      message: result.message
    };
  } catch (error) {
    console.error("Error testing Asterisk connection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred testing connection"
    };
  }
};
