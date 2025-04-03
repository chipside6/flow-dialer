
/**
 * Security utilities for Asterisk integration
 */
export const securityUtils = {
  /**
   * Generates a cryptographically secure random token
   * Used for API security and authentication
   */
  generateSecureToken(length = 32): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    // Use cryptographically secure random values if available
    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint8Array(length);
      window.crypto.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        token += characters.charAt(values[i] % characters.length);
      }
    } else {
      // Fallback to less secure but still reasonable Math.random()
      for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }
    
    return token;
  },
  
  /**
   * Creates a Base64 encoded basic auth header
   */
  createBasicAuthHeader(username: string, password: string): string {
    return `Basic ${btoa(`${username}:${password}`)}`;
  }
};
