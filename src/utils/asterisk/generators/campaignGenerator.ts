
import { baseGenerator } from './baseGenerator';

/**
 * Campaign-specific configuration generators for Asterisk
 */
export const campaignGenerator = {
  /**
   * Generate a complete configuration for a campaign
   * Combines SIP trunk config and dialplan with actual values rather than placeholders
   */
  generateFullConfig(
    campaignId: string,
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string,
    greetingFileUrl: string,
    transferNumber: string
  ) {
    const sipConfig = baseGenerator.generateSipTrunkConfig(
      providerName, 
      host, 
      port, 
      username, 
      password
    );
    
    const dialplan = baseGenerator.generateDialplan(
      campaignId,
      greetingFileUrl,
      transferNumber
    );
    
    return `
; SIP Provider Configuration
; --------------------------
; This section should be placed in your pjsip.conf or sip.conf file
${sipConfig}

; Dialplan Configuration
; ---------------------
; This section should be placed in your extensions.conf file
${dialplan}

; Installation Instructions:
; 1. Add the SIP Provider section to your pjsip.conf or sip.conf
; 2. Add the Dialplan section to your extensions.conf
; 3. Reload Asterisk configuration with: 'asterisk -rx "core reload"'
; 4. Test your configuration with: 'asterisk -rx "dialplan show campaign-${campaignId}"'
`.trim();
  },

  /**
   * Generate configurations for all user campaigns
   * This automatically creates configurations for each campaign using its associated resources
   */
  generateAllCampaignsConfig(
    campaigns: any[],
    providers: any[],
    greetingFiles: any[],
    transferNumbers: any[]
  ) {
    // If any required resources are missing, return an empty string
    if (campaigns.length === 0 || providers.length === 0 || greetingFiles.length === 0 || transferNumbers.length === 0) {
      return "";
    }

    // Generate configs for each campaign with its associated resources
    const configs = campaigns.map(campaign => {
      // Use the specified provider for this campaign or default to the first active one
      const provider = campaign.sipProviderId 
        ? providers.find(p => p.id === campaign.sipProviderId) 
        : providers.find(p => p.isActive) || providers[0];
      
      // Use the specified greeting file or default to the first one
      const greetingUrl = campaign.greetingFileUrl || (greetingFiles[0]?.file_path || greetingFiles[0]?.url);
      
      // Use the specified transfer number or default to the first one
      const transferNumber = campaign.transferNumber || (transferNumbers[0]?.number || transferNumbers[0]?.phone_number);
      
      return this.generateFullConfig(
        campaign.id,
        provider.name,
        provider.host,
        provider.port,
        provider.username,
        provider.password,
        greetingUrl,
        transferNumber
      );
    }).join('\n\n');
    
    return configs;
  },

  /**
   * Generate a configuration using the first available SIP provider, greeting file, and transfer number
   * This eliminates the need for manual selection
   */
  generateAutoConfig(
    providers: any[],
    greetingFiles: any[],
    transferNumbers: any[]
  ) {
    // If any required resource is missing, return an empty string
    if (providers.length === 0 || greetingFiles.length === 0 || transferNumbers.length === 0) {
      return "";
    }

    // Use the first active provider
    const provider = providers.find(p => p.isActive) || providers[0];
    // Use the first greeting file
    const greeting = greetingFiles[0];
    // Use the first transfer number
    const transfer = transferNumbers[0];

    return this.generateFullConfig(
      "auto-campaign",
      provider.name,
      provider.host,
      provider.port,
      provider.username,
      provider.password,
      greeting.file_path || greeting.url,
      transfer.number || transfer.phone_number
    );
  }
};
