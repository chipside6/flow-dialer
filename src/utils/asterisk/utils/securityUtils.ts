
/**
 * Security utilities for Asterisk integration
 */

import { createBasicAuthHeader } from '../config';

/**
 * Generate secure token for API authentication
 */
export const generateSecureToken = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
};

export const securityUtils = {
  generateSecureToken,
  createBasicAuthHeader
};
