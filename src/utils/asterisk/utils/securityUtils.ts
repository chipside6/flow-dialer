
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
  }
};
