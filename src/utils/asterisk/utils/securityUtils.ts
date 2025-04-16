
/**
 * Security utilities for the Asterisk services
 */
export const securityUtils = {
  /**
   * Generate a secure random token
   */
  generateSecureToken: (length: number = 16): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(randomValues[i] % charset.length);
    }
    
    return result;
  },
  
  /**
   * Generate a simple password (more user-friendly)
   */
  generateSimplePassword: (length: number = 10): string => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(randomValues[i] % charset.length);
    }
    
    return result;
  },
  
  /**
   * Hash a password (for local storage only)
   */
  hashPassword: async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};
