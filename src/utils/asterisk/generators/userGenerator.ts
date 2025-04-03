
import { campaignGenerator } from './campaignGenerator';

/**
 * User-specific configuration generators for Asterisk
 */
export const userGenerator = {
  /**
   * Generate configuration for a specific user's campaign by user ID and campaign ID
   * This allows targeted generation of configuration for specific users
   */
  generateUserCampaignConfig(
    userId: string,
    campaignId: string,
    fetchUserResources: (userId: string) => Promise<any>,
    fetchCampaignDetails: (campaignId: string) => Promise<any>
  ) {
    return async () => {
      try {
        // Fetch all resources for this user
        const resources = await fetchUserResources(userId);
        
        // Fetch specific campaign details
        const campaign = await fetchCampaignDetails(campaignId);
        
        if (!resources || !campaign) {
          throw new Error(`Could not fetch data for user ${userId} or campaign ${campaignId}`);
        }
        
        // Extract resources
        const { providers, greetingFiles, transferNumbers } = resources;
        
        // Ensure we have required resources
        if (!providers?.length || !greetingFiles?.length || !transferNumbers?.length) {
          throw new Error("Missing required resources for campaign configuration");
        }
        
        // Find the provider specified for this campaign or use default
        const provider = campaign.sipProviderId 
          ? providers.find((p: any) => p.id === campaign.sipProviderId) 
          : providers.find((p: any) => p.isActive) || providers[0];
        
        // Get greeting file and transfer number from campaign or defaults
        const greetingUrl = campaign.greetingFileUrl || 
          (greetingFiles[0]?.file_path || greetingFiles[0]?.url);
        
        const transferNumber = campaign.transferNumber || 
          (transferNumbers[0]?.number || transferNumbers[0]?.phone_number);
        
        // Generate the full configuration
        return campaignGenerator.generateFullConfig(
          campaign.id,
          provider.name,
          provider.host,
          provider.port,
          provider.username,
          provider.password,
          greetingUrl,
          transferNumber
        );
      } catch (error) {
        console.error(`Error generating configuration for user ${userId}, campaign ${campaignId}:`, error);
        return `
; Error generating configuration
; -----------------------------
; Could not generate configuration for user ${userId}, campaign ${campaignId}
; Error: ${error instanceof Error ? error.message : 'Unknown error'}
; Please ensure the user and campaign exist and have proper resources configured.
        `.trim();
      }
    };
  }
};
