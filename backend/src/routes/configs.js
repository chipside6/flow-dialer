
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Generates and returns Asterisk configuration for a specific user
router.get('/asterisk-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: true, message: 'User ID is required' });
    }
    
    // Fetch all necessary user resources
    const [sipProviders] = await pool.query('SELECT * FROM sip_providers WHERE user_id = ? AND active = true', [userId]);
    const [greetingFiles] = await pool.query('SELECT * FROM greeting_files WHERE user_id = ?', [userId]);
    const [transferNumbers] = await pool.query('SELECT * FROM transfer_numbers WHERE user_id = ?', [userId]);
    const [campaigns] = await pool.query('SELECT * FROM campaigns WHERE user_id = ?', [userId]);
    
    // Ensure we have the necessary resources
    if (sipProviders.length === 0 || greetingFiles.length === 0 || transferNumbers.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required resources',
        missingResources: {
          sipProviders: sipProviders.length === 0,
          greetingFiles: greetingFiles.length === 0,
          transferNumbers: transferNumbers.length === 0
        }
      });
    }
    
    // Generate configuration
    let config = '';
    
    // If we have campaigns, generate configuration for all of them
    if (campaigns.length > 0) {
      // Generate separate configs for each campaign
      const campaignConfigs = campaigns.map(campaign => {
        // Find resources for this campaign
        const provider = campaign.sip_provider_id ? 
          sipProviders.find(p => p.id === campaign.sip_provider_id) : 
          sipProviders[0];
        
        const greeting = campaign.greeting_file_url ? 
          greetingFiles.find(g => g.url === campaign.greeting_file_url) : 
          greetingFiles[0];
        
        const transfer = campaign.transfer_number ? 
          transferNumbers.find(t => t.phone_number === campaign.transfer_number) : 
          transferNumbers[0];
        
        // Generate configuration with resources
        return `
; ===============================================
; Campaign: ${campaign.title} (ID: ${campaign.id})
; ===============================================

; SIP Provider Configuration
; --------------------------
[${provider.name}]
type=peer
host=${provider.host}
port=${provider.port}
username=${provider.username}
secret=${provider.password}
fromuser=${provider.username}
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

; Dialplan Configuration
; ---------------------
[campaign-${campaign.id}]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(${greeting.url || 'greeting'})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to ${transfer.phone_number || ''})
exten => 1,n,Dial(SIP/${transfer.phone_number || ''},30,g)
exten => 1,n,Hangup()
        `.trim();
      });
      
      // Master configuration with all campaigns
      config = `
; =================================================================
; AUTOMATED CAMPAIGN SYSTEM - MASTER CONFIGURATION FOR USER ${userId}
; =================================================================

${campaignConfigs.join('\n\n')}

; =================================================================
; UNIVERSAL CAMPAIGN LAUNCHER
; =================================================================
[campaign-launcher]
; Launch any campaign by ID
exten => _X.,1,NoOp(Running campaign: \${EXTEN})
exten => _X.,n,Goto(campaign-\${EXTEN},s,1)

; =================================================================
; INSTALLATION INSTRUCTIONS
; =================================================================
; 1. Add this configuration to your Asterisk server
; 2. Use "dialplan reload" and "sip reload" to apply changes
; 3. To run a campaign: "originate Local/CAMPAIGN_ID@campaign-launcher extension CAMPAIGN_ID@campaign-launcher"
      `.trim();
    } else {
      // Create a default configuration with the first available resources
      const provider = sipProviders[0];
      const greeting = greetingFiles[0];
      const transfer = transferNumbers[0];
      
      config = `
; =================================================================
; DEFAULT CONFIGURATION FOR USER ${userId}
; =================================================================

; SIP Provider Configuration
; --------------------------
[${provider.name}]
type=peer
host=${provider.host}
port=${provider.port}
username=${provider.username}
secret=${provider.password}
fromuser=${provider.username}
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

; Dialplan Configuration
; ---------------------
[default-campaign]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(${greeting.url || 'greeting'})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to ${transfer.phone_number || ''})
exten => 1,n,Dial(SIP/${transfer.phone_number || ''},30,g)
exten => 1,n,Hangup()

; =================================================================
; INSTALLATION INSTRUCTIONS
; =================================================================
; 1. Add this configuration to your Asterisk server
; 2. Use "dialplan reload" and "sip reload" to apply changes
; 3. To run the default campaign: "originate Local/s@default-campaign extension s@default-campaign"
      `.trim();
    }
    
    res.status(200).json({ config });
  } catch (error) {
    console.error('Error generating Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating Asterisk configuration' });
  }
});

// Generate master configuration for all users
router.get('/asterisk-master', async (req, res) => {
  try {
    // This endpoint generates a single configuration file that can be installed on an Asterisk server
    // that will automatically run all users' campaigns without any additional configuration
    
    const masterConfig = `
; =====================================================================
; FULLY AUTOMATED MULTI-USER CAMPAIGN SYSTEM
; =====================================================================
; This configuration automatically handles all users and campaigns
; Install this ONCE on your Asterisk server
; All campaigns will work automatically through the API

; -------------------------
; GLOBAL CONFIGURATION
; -------------------------
[globals]
API_URL=http://yourserver.com/api
API_TOKEN=YOUR_SECURE_TOKEN_HERE
RETRY_COUNT=3
CALL_TIMEOUT=30

; -------------------------
; DYNAMIC USER MANAGEMENT
; -------------------------
[user-campaign-manager]
; This context handles fetching configuration for any user/campaign
exten => _X.,1,NoOp(Fetching configuration for: \${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(EXTEN,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(EXTEN,_,2)})
exten => _X.,n,System(curl -s "\${API_URL}/configs/asterisk-campaign/\${USER_ID}/\${CAMPAIGN_ID}?token=\${API_TOKEN}" > /tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.conf)
exten => _X.,n,System(asterisk -rx "dialplan reload")
exten => _X.,n,NoOp(Configuration loaded for user \${USER_ID}, campaign \${CAMPAIGN_ID})
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)

; -------------------------
; DYNAMIC CONFIGURATION INCLUDE
; -------------------------
#include "/tmp/campaign-config-*.conf"

; -------------------------
; INSTALLATION INSTRUCTIONS
; -------------------------
; 1. Place this file in your Asterisk server's configuration directory
; 2. Create a secure API endpoint to generate campaign configurations
; 3. Set the API_URL and API_TOKEN variables
; 4. Reload Asterisk configuration
; 5. To run a campaign, call: asterisk -rx "originate Local/USER_ID_CAMPAIGN_ID@user-campaign-manager extension USER_ID_CAMPAIGN_ID@user-campaign-manager"
; 6. The system will automatically fetch the configuration, reload it, and execute the campaign

; -------------------------
; API INSTRUCTIONS
; -------------------------
; Your API should have an endpoint that returns Asterisk configuration text:
; GET /configs/asterisk-campaign/{userId}/{campaignId}
; 
; The returned text should define:
; 1. The SIP provider configuration for the [campaign-{campaignId}] context
; 2. The dialplan for handling greeting playback and transfers
; 3. Any additional settings required for the campaign

; -------------------------
; DATABASE STRUCTURE
; -------------------------
; This system assumes you have tables for:
; - users: Contains user accounts
; - campaigns: Contains campaign settings tied to users
; - sip_providers: Contains SIP trunk settings
; - greeting_files: Contains audio greeting files
; - transfer_numbers: Contains numbers for transfers
; - contacts: Contains phone numbers to call
`.trim();
    
    res.status(200).json({ config: masterConfig });
  } catch (error) {
    console.error('Error generating master Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating master Asterisk configuration' });
  }
});

// Generate configuration for a specific campaign
router.get('/asterisk-campaign/:userId/:campaignId', async (req, res) => {
  try {
    const { userId, campaignId } = req.params;
    
    if (!userId || !campaignId) {
      return res.status(400).json({ error: true, message: 'User ID and Campaign ID are required' });
    }
    
    // Fetch campaign details
    const [campaigns] = await pool.query('SELECT * FROM campaigns WHERE id = ? AND user_id = ?', [campaignId, userId]);
    
    if (campaigns.length === 0) {
      return res.status(404).json({ error: true, message: 'Campaign not found' });
    }
    
    const campaign = campaigns[0];
    
    // Fetch resources
    const [sipProviders] = await pool.query(
      'SELECT * FROM sip_providers WHERE user_id = ? AND (id = ? OR active = true)',
      [userId, campaign.sip_provider_id || '']
    );
    
    const [greetingFiles] = await pool.query(
      'SELECT * FROM greeting_files WHERE user_id = ?',
      [userId]
    );
    
    const [transferNumbers] = await pool.query(
      'SELECT * FROM transfer_numbers WHERE user_id = ?',
      [userId]
    );
    
    // Find the correct resources
    const provider = campaign.sip_provider_id ? 
      sipProviders.find(p => p.id === campaign.sip_provider_id) : 
      sipProviders.find(p => p.active) || sipProviders[0];
    
    const greeting = campaign.greeting_file_url ? 
      greetingFiles.find(g => g.url === campaign.greeting_file_url) : 
      greetingFiles[0];
    
    const transfer = campaign.transfer_number ? 
      transferNumbers.find(t => t.phone_number === campaign.transfer_number) : 
      transferNumbers[0];
    
    if (!provider || !greeting || !transfer) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required resources for campaign',
        missingResources: {
          provider: !provider,
          greeting: !greeting,
          transfer: !transfer
        }
      });
    }
    
    // Generate configuration
    const config = `
; ===============================================
; Campaign: ${campaign.title} (ID: ${campaign.id})
; ===============================================

; SIP Provider Configuration
; --------------------------
[${provider.name}]
type=peer
host=${provider.host}
port=${provider.port}
username=${provider.username}
secret=${provider.password}
fromuser=${provider.username}
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

; Dialplan Configuration
; ---------------------
[campaign-${campaign.id}]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(${greeting.url || 'greeting'})
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to ${transfer.phone_number || ''})
exten => 1,n,Dial(SIP/${transfer.phone_number || ''},30,g)
exten => 1,n,Hangup()
    `.trim();
    
    res.status(200).json({ config });
  } catch (error) {
    console.error('Error generating campaign Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating campaign Asterisk configuration' });
  }
});

module.exports = router;
