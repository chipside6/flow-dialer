
/**
 * Configuration generators for Asterisk
 */
export const asteriskConfig = {
  /**
   * Generate a SIP trunk configuration for Asterisk
   * Updated with improved parameters and comments for better reliability
   */
  generateSipTrunkConfig(
    providerName: string,
    host: string,
    port: string,
    username: string,
    password: string
  ) {
    // Sanitize provider name to prevent config issues
    const sanitizedName = providerName.replace(/[^a-zA-Z0-9_-]/g, "");
    const portNumber = port ? parseInt(port) : 5060;
    
    return `
[${sanitizedName}]
type=peer
host=${host}
port=${portNumber}
username=${username}
secret=${password}
fromuser=${username}
context=from-trunk
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
rtp_timeout=30
transport=udp
`.trim();
  },
  
  /**
   * Generate a basic dialplan configuration for Asterisk
   * Updated to include more detailed comments and instructions
   */
  generateDialplan(campaignId: string, greetingFileUrl: string, transferNumber: string) {
    return `
[campaign-${campaignId}]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(${greetingFileUrl || 'greeting'})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to ${transferNumber || ''})
exten => 1,n,Dial(SIP/${transferNumber || ''},30,g)
exten => 1,n,Hangup()
`.trim();
  },
  
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
    const sipConfig = this.generateSipTrunkConfig(
      providerName, 
      host, 
      port, 
      username, 
      password
    );
    
    const dialplan = this.generateDialplan(
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
  },
  
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
  },
  
  /**
   * API endpoint function to generate configuration by API call
   * This can be used to integrate with external systems
   */
  generateConfigFromApi(params: any) {
    const {
      user_id,
      campaign_id,
      provider_id,
      greeting_id,
      transfer_id
    } = params;
    
    return async (fetchFunction: (url: string) => Promise<any>) => {
      try {
        // Construct API endpoint URL with parameters
        const apiUrl = `/api/asterisk/generate-config?user_id=${user_id}` + 
          (campaign_id ? `&campaign_id=${campaign_id}` : '') +
          (provider_id ? `&provider_id=${provider_id}` : '') +
          (greeting_id ? `&greeting_id=${greeting_id}` : '') +
          (transfer_id ? `&transfer_id=${transfer_id}` : '');
        
        // Fetch configuration from API
        const result = await fetchFunction(apiUrl);
        
        if (!result || !result.config) {
          throw new Error("API returned empty configuration");
        }
        
        return result.config;
      } catch (error) {
        console.error("Error fetching config from API:", error);
        return `
; Error fetching configuration from API
; -----------------------------------
; Could not fetch configuration for user ${user_id}
; Error: ${error instanceof Error ? error.message : 'Unknown error'}
; Please check the API endpoint and parameters.
        `.trim();
      }
    };
  }
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
