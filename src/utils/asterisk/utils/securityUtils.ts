
/**
 * Security utilities for Asterisk configuration
 */

/**
 * Generate a secure token for SIP authentication
 * @returns A secure random token
 */
export const generateSecureToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 16;
  
  // Generate random string using the Crypto API
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
};

/**
 * Generate a simple password with specified length
 * @param length The length of the password
 * @returns A simple password
 */
export const generateSimplePassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
};

/**
 * Sanitize input to prevent security issues
 * @param input String to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters for Asterisk config
  return input.replace(/[;#\[\]\\]/g, '');
};

export const securityUtils = {
  generateSecureToken,
  generateSimplePassword,
  sanitizeInput
};
