
import { baseGenerator } from './baseGenerator';
import { campaignGenerator } from './campaignGenerator';
import { userGenerator } from './userGenerator';
import { apiGenerator } from './apiGenerator';
import { masterConfigGenerator } from './masterConfigGenerator';

/**
 * Configuration generators for Asterisk
 */
export const asteriskConfig = {
  // Re-export base generators
  generateSipTrunkConfig: baseGenerator.generateSipTrunkConfig,
  generateDialplan: baseGenerator.generateDialplan,
  
  // Re-export campaign generators
  generateFullConfig: campaignGenerator.generateFullConfig,
  generateAllCampaignsConfig: campaignGenerator.generateAllCampaignsConfig,
  generateAutoConfig: campaignGenerator.generateAutoConfig,
  
  // Re-export user generators
  generateUserCampaignConfig: userGenerator.generateSipConfig, // Map to existing method
  
  // Re-export API generators
  generateConfigFromApi: apiGenerator.generateConfigFromApi,
  
  // Re-export master config generator
  generateMasterServerConfig: masterConfigGenerator.generateMasterConfig
};

/**
 * Generate a complete SIP configuration that includes the user's transfer number and greeting file
 * @deprecated Use asteriskConfig.generateFullConfig instead
 */
export const generateCompleteConfig = (
  campaignId: string,
  sipDetails: {
    providerName: string;
    host: string;
    port: string;
    username: string;
    password: string;
  },
  userConfig: {
    transferNumber: string;
    greetingFile: string;
  }
) => {
  return asteriskConfig.generateFullConfig(
    campaignId,
    sipDetails.providerName,
    sipDetails.host,
    sipDetails.port,
    sipDetails.username,
    sipDetails.password,
    userConfig.greetingFile,
    userConfig.transferNumber
  );
};
