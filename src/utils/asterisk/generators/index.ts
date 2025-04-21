
/**
 * Central export file for all Asterisk generators
 * This ensures consistent access to generators across the application
 */
import { dialplanGenerator } from './dialplanGenerator';
import { apiGenerator } from './apiGenerator';
import { baseGenerator } from './baseGenerator';
import { campaignGenerator } from './campaignGenerator';
import { masterConfigGenerator } from './masterConfigGenerator';
import { sipConfigGenerator } from './sipConfigGenerator';

// Core generators export
export {
  dialplanGenerator,
  apiGenerator,
  baseGenerator,
  campaignGenerator,
  masterConfigGenerator,
  sipConfigGenerator
};

// Utility function to generate complete configuration for a campaign
export const generateCompleteConfig = async (
  campaignId: string,
  userId: string
) => {
  try {
    // Get dialplan from the dialplan generator
    const dialplanResult = await dialplanGenerator.generateCampaignDialplan(
      campaignId,
      userId
    );

    // Get SIP config from SIP config generator
    const sipResult = await sipConfigGenerator.generateUserSipConfig(userId);

    // Define default values for transferEnabled and transferNumber
    const transferEnabled = (dialplanResult as any).transferEnabled || false;
    const transferNumber = (dialplanResult as any).transferNumber || null;

    return {
      success: dialplanResult.success && sipResult.success,
      dialplanConfig: dialplanResult.config || '',
      sipConfig: sipResult.config || '',
      transferEnabled: transferEnabled,
      transferNumber: transferNumber,
      error: dialplanResult.success ? sipResult.message : dialplanResult.message
    };
  } catch (error) {
    console.error('Error generating complete configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating configuration',
      dialplanConfig: '',
      sipConfig: ''
    };
  }
};

// Convenience function to access all Asterisk config generators
export const asteriskConfig = {
  dialplan: dialplanGenerator,
  sip: sipConfigGenerator,
  campaign: campaignGenerator,
  master: masterConfigGenerator,
  api: apiGenerator,
  base: baseGenerator,
  generateComplete: generateCompleteConfig
};
