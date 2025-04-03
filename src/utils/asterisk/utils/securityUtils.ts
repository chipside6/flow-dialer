
/**
 * Security utilities for Asterisk configuration
 */
export const securityUtils = {
  /**
   * Generates a secure token for API authentication
   * Uses cryptographically secure random values
   */
  generateSecureToken: (): string => {
    // Generate a random string of characters
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    
    // Convert to a hex string
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
  
  /**
   * Sanitizes input to prevent command injection in Asterisk configs
   * @param input String to sanitize
   */
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    
    // Remove characters that could be used for command injection
    return input.replace(/[;&|`$(){}[\]<>]/g, '');
  },
  
  /**
   * Validates a hostname or IP address for SIP configuration
   * @param host Hostname or IP to validate
   */
  validateHost: (host: string): boolean => {
    if (!host) return false;
    
    // Check for valid hostname or IP address format
    const hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    return hostnameRegex.test(host) || ipv4Regex.test(host);
  },

  /**
   * Creates a basic auth header for API authentication
   * @param username Username for basic auth
   * @param password Password for basic auth
   * @returns Base64 encoded basic auth header
   */
  createBasicAuthHeader: (username: string, password: string): string => {
    if (!username || !password) {
      throw new Error('Username and password are required for basic authentication');
    }
    
    // Create the basic auth string and encode it in base64
    const auth = `${username}:${password}`;
    return btoa(auth);
  }
};
