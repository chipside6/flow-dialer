
/**
 * Connection service for Asterisk
 */

// Define the credentials interface
interface ConnectionCredentials {
  apiUrl?: string;
  username?: string;
  password?: string;
}

// Default credentials
const DEFAULT_CREDENTIALS: ConnectionCredentials = {
  apiUrl: 'http://localhost:8088/ari',
  username: 'admin',
  password: 'password'
};

/**
 * Test the connection to Asterisk
 */
export const testConnection = async (credentials: ConnectionCredentials = DEFAULT_CREDENTIALS) => {
  try {
    console.log(`Testing connection to Asterisk at ${credentials.apiUrl}`);
    
    // This is just a mock implementation
    // In a real application, this would make an actual API call to Asterisk
    
    // Simulate an API call with random success/failure
    const success = Math.random() > 0.2; // 80% chance of success
    
    if (success) {
      return {
        success: true,
        message: 'Connection successful'
      };
    } else {
      return {
        success: false,
        error: 'Failed to connect to Asterisk server'
      };
    }
  } catch (error) {
    console.error('Error testing connection to Asterisk:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Reload PJSIP configuration in Asterisk
 */
export const reloadPjsip = async (credentials: ConnectionCredentials = DEFAULT_CREDENTIALS) => {
  try {
    console.log(`Reloading PJSIP configuration on Asterisk at ${credentials.apiUrl}`);
    
    // This is just a mock implementation
    
    // Simulate an API call with random success/failure
    const success = Math.random() > 0.1; // 90% chance of success
    
    if (success) {
      return {
        success: true,
        message: 'PJSIP configuration reloaded successfully'
      };
    } else {
      return {
        success: false,
        error: 'Failed to reload PJSIP configuration'
      };
    }
  } catch (error) {
    console.error('Error reloading PJSIP configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Reload extensions (dialplan) configuration in Asterisk
 */
export const reloadExtensions = async (credentials: ConnectionCredentials = DEFAULT_CREDENTIALS) => {
  try {
    console.log(`Reloading extensions configuration on Asterisk at ${credentials.apiUrl}`);
    
    // This is just a mock implementation
    
    // Simulate an API call with random success/failure
    const success = Math.random() > 0.1; // 90% chance of success
    
    if (success) {
      return {
        success: true,
        message: 'Extensions configuration reloaded successfully'
      };
    } else {
      return {
        success: false,
        error: 'Failed to reload extensions configuration'
      };
    }
  } catch (error) {
    console.error('Error reloading extensions configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Add validateConnection as an alias for testConnection for backward compatibility
export const validateConnection = testConnection;
