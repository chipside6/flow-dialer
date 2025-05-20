
/**
 * Utility functions for security operations
 */
export const securityUtils = {
  /**
   * Generates a simple random password with specified length
   * Uses a combination of letters and numbers
   */
  generateSimplePassword: (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * Generates a strong password with mixed characters
   * Ensures at least one uppercase, one lowercase, one number, and one special character
   */
  generateStrongPassword: (length: number): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+=-[]{}|:;<>?,./';
    
    // Ensure at least one of each character type
    let password = 
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      special.charAt(Math.floor(Math.random() * special.length));
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    password = password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    
    return password;
  },
  
  /**
   * Generates a secure token/password for use with SIP authentication
   * Uses the generateStrongPassword internally with a default length of 16
   */
  generateSecureToken: (length: number = 16): string => {
    return securityUtils.generateStrongPassword(length);
  }
};
