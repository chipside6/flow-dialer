
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

// Interface for config response
interface ConfigResponse {
  success: boolean;
  dialplanConfig: string;
  sipConfig: string;
  transferEnabled: boolean;
  transferNumber: string | null;
  error?: string;
}

/**
 * Utility function to generate complete configuration for a campaign
 */
export const generateCompleteConfig = async (
  campaignId: string,
  userId: string
): Promise<ConfigResponse> => {
  try {
    // Get dialplan from the dialplan generator
    const dialplanResult = await dialplanGenerator.generateCampaignDialplan(
      campaignId,
      userId
    );

    // Check if dialplan generation was successful
    if (!dialplanResult.success) {
      throw new Error(`Dialplan generation failed: ${dialplanResult.message}`);
    }

    // Get SIP config from SIP config generator
    const sipResult = await sipConfigGenerator.generateUserSipConfig(userId);

    // Check if SIP config generation was successful
    if (!sipResult.success) {
      throw new Error(`SIP config generation failed: ${sipResult.message}`);
    }

    // Define default transfer options
    let transferEnabled = false;
    let transferNumber = null;
    
    // Extract transfer data if available in config object
    if (typeof dialplanResult.config === 'object' && dialplanResult.config !== null) {
      transferEnabled = (dialplanResult.config as any)?.transferEnabled ?? false;
      transferNumber = (dialplanResult.config as any)?.transferNumber ?? null;
    }

    return {
      success: true,
      dialplanConfig: typeof dialplanResult.config === 'string' ? dialplanResult.config : '',
      sipConfig: sipResult.config || '',
      transferEnabled,
      transferNumber,
      error: ''
    };
  } catch (error) {
    console.error('Error generating complete configuration:', error);

    // Return structured error response
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating configuration',
      dialplanConfig: '',
      sipConfig: '',
      transferEnabled: false,
      transferNumber: null
    };
  }
};

/**
 * Convenience function to access all Asterisk config generators
 */
export const asteriskConfig = {
  dialplan: dialplanGenerator,
  sip: sipConfigGenerator,
  campaign: campaignGenerator,
  master: masterConfigGenerator,
  api: apiGenerator,
  base: baseGenerator,
  generateComplete: generateCompleteConfig
};
