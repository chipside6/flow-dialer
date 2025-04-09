
import { getConfigFromStorage } from '../config';

/**
 * Security utilities for Asterisk integration
 */
export const securityUtils = {
  /**
   * Create a basic auth header for Asterisk API
   */
  getAuthHeader: (): string => {
    const config = getConfigFromStorage();
    return `Basic ${btoa(`${config.username}:${config.password}`)}`;
  },
  
  /**
   * Sanitize a string for use in a command
   */
  sanitizeCommandInput: (input: string): string => {
    return input.replace(/[;&|"`'$*?#()[]{}~<>\\]/g, '');
  },
  
  /**
   * Check if an API URL is valid
   */
  isValidApiUrl: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Generate a secure token for authentication
   */
  generateSecureToken: (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 32;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
};
