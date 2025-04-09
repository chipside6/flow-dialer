
/**
 * Generate a random password with specified length
 * @param length Length of the password to generate
 * @returns A random password string
 */
export const generateRandomPassword = (length: number = 10): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  
  return password;
};
