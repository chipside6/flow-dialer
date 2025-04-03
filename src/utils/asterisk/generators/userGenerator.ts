
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
        // Add timeout to prevent infinite loading
        const resourcesPromise = fetchUserResources(userId);
        const campaignPromise = fetchCampaignDetails(campaignId);
        
        // Set a timeout for fetch operations
        const timeout = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
        );
        
        // Race between fetch and timeout
        const [resources, campaign] = await Promise.all([
          Promise.race([resourcesPromise, timeout]) as Promise<any>,
          Promise.race([campaignPromise, timeout]) as Promise<any>
        ]);
        
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
  },

  /**
   * Generate a complete server configuration that supports all users in the system
   * This creates one master config file that can be installed on Asterisk once
   */
  generateMasterServerConfig(apiServerUrl = "http://localhost:8000", apiToken = "") {
    // If no token is provided, generate a secure one
    const token = apiToken || this.generateSecureToken();
    
    return `
; =================================================================
; GLOBAL AUTOMATED CAMPAIGN SYSTEM - MASTER SERVER CONFIGURATION
; =================================================================
; This creates a complete server setup that works for all users
; Configure this ONCE and all users' campaigns will work automatically

; ------------------------
; GLOBAL API SETTINGS
; ------------------------
[globals]
; Your application's backend API URL (where Asterisk can fetch campaign configurations)
; This is NOT Supabase credentials - it's your own application's backend API URL
API_SERVER=${apiServerUrl}
; A secure token to authenticate requests to your backend API
; Keep this token secure and make sure it matches what you configure in your backend
API_TOKEN=${token}
RETRY_COUNT=3
CALL_TIMEOUT=30

; ------------------------
; DATABASE CONNECTOR SETUP
; ------------------------
[database-connector]
; This context handles all database operations
exten => s,1,NoOp(Database connector activated)
exten => s,n,Set(DB_REQUEST=\${ARG1})
exten => s,n,Set(USER_ID=\${ARG2})
exten => s,n,Set(CAMPAIGN_ID=\${ARG3})
exten => s,n,System(curl -s "\${API_SERVER}/api/configs/asterisk-campaign/\${USER_ID}/\${CAMPAIGN_ID}?token=\${API_TOKEN}" -o /tmp/asterisk-data-\${USER_ID}-\${CAMPAIGN_ID}.json)
exten => s,n,NoOp(Database request complete)
exten => s,n,Return

; ------------------------
; USER CAMPAIGN ROUTER
; ------------------------
[user-campaign-router]
; Route incoming requests to the appropriate campaign
exten => _X.,1,NoOp(Routing request for: \${EXTEN})
exten => _X.,n,Set(REQUEST_DATA=\${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(REQUEST_DATA,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(REQUEST_DATA,_,2)})
exten => _X.,n,Gosub(database-connector,s,1(campaign,\${USER_ID},\${CAMPAIGN_ID}))
exten => _X.,n,Gosub(campaign-runner,s,1(\${USER_ID},\${CAMPAIGN_ID}))
exten => _X.,n,Hangup()

; -------------------------
; DYNAMIC CAMPAIGN RUNNER
; -------------------------
[campaign-runner]
; This macro runs any user's campaign with dynamic configuration
exten => s,1,NoOp(Running campaign for user \${ARG1}, campaign \${ARG2})
exten => s,n,Set(USER_ID=\${ARG1})
exten => s,n,Set(CAMPAIGN_ID=\${ARG2})
exten => s,n,Answer()
exten => s,n,Wait(1)

; Get greeting file from database or API
exten => s,n,Set(GREETING_FILE=\${SHELL(cat /tmp/asterisk-data-\${USER_ID}-\${CAMPAIGN_ID}.json | jq -r .greeting_file)})
exten => s,n,NoOp(Playing greeting: \${GREETING_FILE})
exten => s,n,Playback(\${GREETING_FILE})

; Wait for keypress
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle transfer request
exten => 1,1,NoOp(Transfer requested)
exten => 1,n,Set(TRANSFER_NUMBER=\${SHELL(cat /tmp/asterisk-data-\${USER_ID}-\${CAMPAIGN_ID}.json | jq -r .transfer_number)})
exten => 1,n,NoOp(Transferring to: \${TRANSFER_NUMBER})
exten => 1,n,Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => 1,n,Hangup()

; -------------------------
; SIP TRUNK DYNAMIC LOADER
; -------------------------
#include "dynamic_sip_trunks/*.conf"

; -------------------------
; SYSTEM MAINTENANCE
; -------------------------
[system-maintenance]
; Scheduled tasks for system upkeep
exten => s,1,NoOp(Running system maintenance)
exten => s,n,System(find /tmp -name "asterisk-data-*" -mtime +1 -delete)
exten => s,n,Hangup()

; -------------------------
; INSTALLATION INSTRUCTIONS
; -------------------------
; 1. Place this file in /etc/asterisk/extensions.conf or include it
; 2. Create directory for dynamic SIP trunks: mkdir -p /etc/asterisk/dynamic_sip_trunks
; 3. Install jq for JSON parsing: apt-get install jq
; 4. Set up a cron job for maintenance:
;    0 2 * * * /usr/sbin/asterisk -rx "dialplan reload" && /usr/sbin/asterisk -rx "originate Local/s@system-maintenance extension s@system-maintenance"
; 5. Reload Asterisk configuration: asterisk -rx "dialplan reload"
; 6. Configure your backend API to handle requests to: ${apiServerUrl}/api/configs/asterisk-campaign/{userId}/{campaignId}?token=${token}
; 
; IMPORTANT: This is NOT related to Supabase credentials - the API_SERVER and API_TOKEN are for your own backend API
`.trim();
  },
  
  /**
   * Generate a cryptographically secure token for API security
   * @private
   */
  generateSecureToken() {
    // Generate a reasonably secure token
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let token = '';
    
    // Use cryptographically secure random values if available
    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint8Array(length);
      window.crypto.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        token += characters.charAt(values[i] % characters.length);
      }
    } else {
      // Fallback to less secure but still reasonable Math.random()
      for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }
    
    return token;
  }
};
