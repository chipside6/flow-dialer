
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
  },

  /**
   * Generate a universal, dynamic Asterisk configuration
   * This creates a master config that automatically detects and runs user campaigns
   */
  generateAutomatedMasterConfig() {
    return `
; =====================================================================
; AUTOMATED CAMPAIGN SYSTEM - MASTER CONFIGURATION
; =====================================================================
; This configuration automatically fetches and runs user campaigns
; Place this file on your Asterisk server and it will handle everything 

; -------------------------
; GLOBAL CONFIGURATION
; -------------------------
[globals]
; Database connection info
DB_HOST=localhost
DB_NAME=callcenter
DB_USER=asterisk
DB_PASS=password

; Campaign settings
MAX_CONCURRENT_CALLS=5
RETRY_COUNT=3
CALL_TIMEOUT=30

; -------------------------
; DYNAMIC SIP PROVIDERS
; -------------------------
#include "dynamic_sip_providers.conf"

; -------------------------
; AUTOMATED DIALPLAN
; -------------------------
[auto-campaign-runner]
; This macro fetches user campaign data and dynamically creates the needed context
exten => s,1,NoOp(Starting automated campaign for user: \${ARG1}, campaign: \${ARG2})
exten => s,n,Set(USER_ID=\${ARG1})
exten => s,n,Set(CAMPAIGN_ID=\${ARG2})
exten => s,n,System(php /etc/asterisk/scripts/fetch_campaign_data.php \${USER_ID} \${CAMPAIGN_ID})
exten => s,n,NoOp(Campaign data fetched successfully)
exten => s,n,Goto(campaign-\${CAMPAIGN_ID},s,1)

; Main entry point for campaigns
[campaign-runner]
; Dynamic campaign context with user_id/campaign_id arguments
exten => _X.,1,NoOp(Running campaign: \${EXTEN})
exten => _X.,n,Set(CAMPAIGN_ID=\${EXTEN})
exten => _X.,n,Set(USER_ID=\${DB(campaigns/\${CAMPAIGN_ID}/user_id)})
exten => _X.,n,Gosub(auto-campaign-runner,s,1(\${USER_ID},\${CAMPAIGN_ID}))

; Contact list processor
[process-contact-list]
exten => s,1,NoOp(Processing contact list for campaign: \${CAMPAIGN_ID})
exten => s,n,Set(CONTACT_LIST_ID=\${DB(campaigns/\${CAMPAIGN_ID}/contact_list_id)})
exten => s,n,System(php /etc/asterisk/scripts/process_contact_list.php \${CONTACT_LIST_ID} \${CAMPAIGN_ID})
exten => s,n,NoOp(Contact list processing complete)

; -------------------------
; ACCOMPANYING SCRIPTS
; -------------------------
; fetch_campaign_data.php - Fetches campaign details from database
; process_contact_list.php - Processes contacts for a campaign
; update_campaign_status.php - Updates campaign status/progress
; handle_call_result.php - Processes call outcomes

; -------------------------
; INSTALLATION INSTRUCTIONS
; -------------------------
; 1. Place this file in /etc/asterisk/extensions.conf (or include it)
; 2. Create the scripts directory: mkdir -p /etc/asterisk/scripts
; 3. Add the PHP scripts to the scripts directory
; 4. Set up a cron job to check for pending campaigns:
;    */5 * * * * /usr/bin/php /etc/asterisk/scripts/check_pending_campaigns.php
; 5. Reload Asterisk: asterisk -rx "dialplan reload"
`.trim();
  },

  /**
   * Generate a PHP script to fetch campaign data from the database
   * This allows the Asterisk server to dynamically generate configurations
   */
  generateCampaignFetcherScript() {
    return `
<?php
// fetch_campaign_data.php - Fetches campaign details and creates dynamic dialplan

// Check arguments
if ($argc < 3) {
    die("Usage: php fetch_campaign_data.php <user_id> <campaign_id>\\n");
}

$user_id = $argv[1];
$campaign_id = $argv[2];

// Database connection
$db_host = 'localhost';
$db_name = 'callcenter';
$db_user = 'asterisk';
$db_pass = 'password';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch campaign details
    $stmt = $pdo->prepare("
        SELECT c.*, 
               sp.name as provider_name, sp.host, sp.port, sp.username, sp.password,
               g.url as greeting_url, 
               t.phone_number as transfer_number
        FROM campaigns c
        LEFT JOIN sip_providers sp ON c.sip_provider_id = sp.id
        LEFT JOIN greeting_files g ON c.greeting_file_url = g.url
        LEFT JOIN transfer_numbers t ON c.transfer_number = t.phone_number
        WHERE c.id = :campaign_id AND c.user_id = :user_id
    ");
    
    $stmt->execute([
        ':campaign_id' => $campaign_id,
        ':user_id' => $user_id
    ]);
    
    $campaign = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$campaign) {
        die("Error: Campaign not found for user $user_id and campaign $campaign_id\\n");
    }
    
    // Store data in Asterisk database for dialplan access
    exec("asterisk -rx \"database put campaigns $campaign_id/provider_name {$campaign['provider_name']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/host {$campaign['host']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/port {$campaign['port']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/username {$campaign['username']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/password {$campaign['password']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/greeting_url {$campaign['greeting_url']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/transfer_number {$campaign['transfer_number']}\"");
    exec("asterisk -rx \"database put campaigns $campaign_id/contact_list_id {$campaign['contact_list_id']}\"");
    
    // Generate the dynamic dialplan for this campaign
    $dialplan = "
[campaign-$campaign_id]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback({$campaign['greeting_url']})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to {$campaign['transfer_number']})
exten => 1,n,Dial(SIP/{$campaign['transfer_number']},30,g)
exten => 1,n,Hangup()
    ";
    
    // Write the dynamic dialplan to a file
    file_put_contents("/etc/asterisk/campaign-$campaign_id.conf", $dialplan);
    
    // Add the dynamic trunk to the SIP configuration
    $sipConfig = "
[{$campaign['provider_name']}]
type=peer
host={$campaign['host']}
port={$campaign['port']}
username={$campaign['username']}
secret={$campaign['password']}
fromuser={$campaign['username']}
context=from-trunk
    ";
    
    file_put_contents("/etc/asterisk/provider-{$campaign['provider_name']}.conf", $sipConfig);
    
    // Reload the dialplan
    exec("asterisk -rx \"dialplan reload\"");
    exec("asterisk -rx \"sip reload\"");
    
    echo "Campaign $campaign_id configuration loaded successfully\\n";
    
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\\n");
}
`.trim();
  }
};
