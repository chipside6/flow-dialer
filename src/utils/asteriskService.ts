
import { asteriskService } from './asterisk';

// Environment variables or configuration constants would normally be imported
// We're providing fallbacks for now
const ASTERISK_API_URL = process.env.ASTERISK_API_URL || 'http://localhost:8088/ari';
const ASTERISK_API_USERNAME = process.env.ASTERISK_API_USERNAME || 'admin';
const ASTERISK_API_PASSWORD = process.env.ASTERISK_API_PASSWORD || 'password';

// Default Asterisk configuration
const asteriskConfig = {
  apiUrl: ASTERISK_API_URL,
  username: ASTERISK_API_USERNAME,
  password: ASTERISK_API_PASSWORD
};

// Export the pre-configured Asterisk service
export const configuredAsteriskService = {
  ...asteriskService,
  config: asteriskConfig,
  
  // Method that uses the default config
  testConnectionWithDefaultConfig: () => {
    return asteriskService.testConnection(asteriskConfig);
  },
  
  // Method to start a campaign with the default config
  startCampaign: (campaignId: string, options: any) => {
    console.log('Starting campaign with ID:', campaignId, 'options:', options);
    // This would integrate with the asteriskService.startDialing method
    return asteriskService.startDialing({
      campaignId,
      ...options
    });
  },
  
  // Method to stop a campaign with the default config
  stopCampaign: (campaignId: string) => {
    console.log('Stopping campaign with ID:', campaignId);
    return asteriskService.stopDialingCampaign(campaignId);
  }
};

export default configuredAsteriskService;
