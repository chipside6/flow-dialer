
import { asteriskService as originalAsteriskService } from './asterisk';

// Environment variables or configuration constants would normally be imported
// We're providing fallbacks for now
const ASTERISK_API_URL = import.meta.env.VITE_ASTERISK_API_URL || 'http://localhost:8088/ari';
const ASTERISK_API_USERNAME = import.meta.env.VITE_ASTERISK_API_USERNAME || 'admin';
const ASTERISK_API_PASSWORD = import.meta.env.VITE_ASTERISK_API_PASSWORD || 'password';

// Default Asterisk configuration
export const asteriskConfig = {
  apiUrl: ASTERISK_API_URL,
  username: ASTERISK_API_USERNAME,
  password: ASTERISK_API_PASSWORD
};

// Export the asteriskService for components that import it directly
export const asteriskService = {
  ...originalAsteriskService,
  config: asteriskConfig,
  
  // Method that uses the default config
  testConnectionWithDefaultConfig: () => {
    return originalAsteriskService.testConnection(asteriskConfig);
  },
  
  // Method to start a campaign with the default config
  startCampaign: (campaignId: string, options: any) => {
    console.log('Starting campaign with ID:', campaignId, 'options:', options);
    // This would integrate with the asteriskService.startDialing method
    return originalAsteriskService.startDialing({
      campaignId,
      ...options
    });
  },
  
  // Method to stop a campaign with the default config
  stopCampaign: (campaignId: string) => {
    console.log('Stopping campaign with ID:', campaignId);
    return originalAsteriskService.stopDialingCampaign(campaignId);
  }
};

// Also export as default for components that import it as default
export default asteriskService;
