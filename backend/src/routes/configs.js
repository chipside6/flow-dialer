
const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Cache mechanism for config generation
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or generate new
const getCachedOrGenerate = async (cacheKey, generateFn) => {
  const now = Date.now();
  const cached = configCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  
  const data = await generateFn();
  configCache.set(cacheKey, { data, timestamp: now });
  return data;
};

// Generates and returns Asterisk configuration for a specific user
router.get('/asterisk-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: true, message: 'User ID is required' });
    }
    
    // Use cache mechanism
    const cacheKey = `user-config-${userId}`;
    const config = await getCachedOrGenerate(cacheKey, async () => {
      // Fetch all necessary user resources in a single transaction for consistency
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        const [sipProviders] = await connection.query('SELECT * FROM sip_providers WHERE user_id = ? AND active = true', [userId]);
        const [greetingFiles] = await connection.query('SELECT * FROM greeting_files WHERE user_id = ?', [userId]);
        const [transferNumbers] = await connection.query('SELECT * FROM transfer_numbers WHERE user_id = ?', [userId]);
        const [campaigns] = await connection.query('SELECT * FROM campaigns WHERE user_id = ?', [userId]);
        
        await connection.commit();
        connection.release();
        
        // Ensure we have the necessary resources
        if (sipProviders.length === 0 || greetingFiles.length === 0 || transferNumbers.length === 0) {
          return { 
            error: true, 
            message: 'Missing required resources',
            missingResources: {
              sipProviders: sipProviders.length === 0,
              greetingFiles: greetingFiles.length === 0,
              transferNumbers: transferNumbers.length === 0
            }
          };
        }
        
        // Generate configuration
        let configText = '';
        
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
          configText = `
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
          
          configText = `
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
        
        return { config: configText };
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    });
    
    if (config.error) {
      return res.status(400).json(config);
    }
    
    res.status(200).json(config);
  } catch (error) {
    console.error('Error generating Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating Asterisk configuration' });
  }
});

// Generate master configuration that automatically loads all users' campaigns
router.get('/asterisk-master', async (req, res) => {
  try {
    const cacheKey = 'master-config';
    const masterConfig = await getCachedOrGenerate(cacheKey, async () => {
      const masterConfigText = `
; =====================================================================
; FULLY AUTOMATED MULTI-USER CAMPAIGN SYSTEM - OPTIMIZED
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
DEBUG_LEVEL=3

; -------------------------
; DYNAMIC USER MANAGEMENT
; -------------------------
[user-campaign-manager]
; This context handles fetching configuration for any user/campaign with efficient caching
exten => _X.,1,NoOp(Fetching configuration for: \${EXTEN})
exten => _X.,n,Set(USER_ID=\${CUT(EXTEN,_,1)})
exten => _X.,n,Set(CAMPAIGN_ID=\${CUT(EXTEN,_,2)})
exten => _X.,n,Set(CACHE_FILE=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.conf)
exten => _X.,n,Set(CACHE_TIME=/tmp/campaign-config-\${USER_ID}-\${CAMPAIGN_ID}.time)
exten => _X.,n,TrySystem(test -f \${CACHE_FILE})
exten => _X.,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?cache_check:fetch_new)
exten => _X.,n(cache_check),TrySystem(find \${CACHE_FILE} -mmin -60 | grep -q \${CACHE_FILE})
exten => _X.,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?use_cache:fetch_new)
exten => _X.,n(use_cache),NoOp(Using cached configuration)
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)
exten => _X.,n(fetch_new),NoOp(Fetching fresh configuration)
exten => _X.,n,System(curl -s "\${API_URL}/configs/asterisk-campaign/\${USER_ID}/\${CAMPAIGN_ID}?token=\${API_TOKEN}" > \${CACHE_FILE})
exten => _X.,n,System(date +%s > \${CACHE_TIME})
exten => _X.,n,System(asterisk -rx "dialplan reload")
exten => _X.,n,NoOp(Configuration loaded for user \${USER_ID}, campaign \${CAMPAIGN_ID})
exten => _X.,n,Goto(campaign-\${CAMPAIGN_ID},s,1)

; -------------------------
; DYNAMIC CONFIGURATION INCLUDE WITH AUTOMATIC CLEANUP
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
; 6. The system will efficiently cache and fetch configurations as needed

; -------------------------
; AUTOMATED MAINTENANCE - ADD TO CRON
; -------------------------
; # Automatic cleanup of old cache files (add to crontab)
; 0 */4 * * * find /tmp/campaign-config-*.conf -mmin +240 -delete

; -------------------------
; API INSTRUCTIONS
; -------------------------
; Your API should have an endpoint that returns Asterisk configuration text:
; GET /configs/asterisk-campaign/{userId}/{campaignId}
; 
; The returned text should define:
; 1. The SIP provider configuration for the campaign, using the user's own SIP provider
; 2. The dialplan for handling greeting playback and transfers
; 3. Any additional settings required for the campaign
      `.trim();
      
      return { config: masterConfigText };
    });
    
    res.status(200).json(masterConfig);
  } catch (error) {
    console.error('Error generating master Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating master Asterisk configuration' });
  }
});

// Generate configuration for a specific campaign with performance optimizations
router.get('/asterisk-campaign/:userId/:campaignId', async (req, res) => {
  try {
    const { userId, campaignId } = req.params;
    
    if (!userId || !campaignId) {
      return res.status(400).json({ error: true, message: 'User ID and Campaign ID are required' });
    }
    
    // Use cache for frequently accessed campaigns
    const cacheKey = `campaign-config-${userId}-${campaignId}`;
    const config = await getCachedOrGenerate(cacheKey, async () => {
      // Use a single connection and transaction for all queries
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Fetch campaign details - use direct index access instead of multiple queries
        const [campaigns] = await connection.query(
          'SELECT c.*, sp.name as provider_name, sp.host, sp.port, sp.username, sp.password ' +
          'FROM campaigns c ' +
          'LEFT JOIN sip_providers sp ON c.sip_provider_id = sp.id ' +
          'WHERE c.id = ? AND c.user_id = ?', 
          [campaignId, userId]
        );
        
        if (campaigns.length === 0) {
          await connection.commit();
          connection.release();
          return { error: true, message: 'Campaign not found' };
        }
        
        const campaign = campaigns[0];
        
        // Only fetch what we need if not already fetched in the campaign join
        let provider = null;
        if (!campaign.provider_name && campaign.sip_provider_id) {
          const [providers] = await connection.query(
            'SELECT * FROM sip_providers WHERE id = ? AND user_id = ?',
            [campaign.sip_provider_id, userId]
          );
          provider = providers[0];
        } else if (!campaign.provider_name) {
          // Fetch default provider if none specified
          const [providers] = await connection.query(
            'SELECT * FROM sip_providers WHERE user_id = ? AND active = true LIMIT 1',
            [userId]
          );
          provider = providers[0];
        } else {
          // Use the joined data
          provider = {
            name: campaign.provider_name,
            host: campaign.host,
            port: campaign.port,
            username: campaign.username,
            password: campaign.password
          };
        }
        
        // Fetch greeting file and transfer number in parallel for efficiency
        const [greetingFilesResult, transferNumbersResult] = await Promise.all([
          connection.query('SELECT * FROM greeting_files WHERE user_id = ? AND url = ? LIMIT 1', 
                          [userId, campaign.greeting_file_url || '']),
          connection.query('SELECT * FROM transfer_numbers WHERE user_id = ? AND phone_number = ? LIMIT 1', 
                          [userId, campaign.transfer_number || ''])
        ]);
        
        await connection.commit();
        connection.release();
        
        const greetingFiles = greetingFilesResult[0];
        const transferNumbers = transferNumbersResult[0];
        
        // Use first greeting/transfer if we couldn't find the specified one
        let greeting = greetingFiles[0];
        let transfer = transferNumbers[0];
        
        if (!greeting || !transfer) {
          // Fallback queries to get any greeting/transfer if needed
          if (!greeting) {
            const [fallbackGreetings] = await pool.query(
              'SELECT * FROM greeting_files WHERE user_id = ? LIMIT 1', [userId]
            );
            greeting = fallbackGreetings[0];
          }
          
          if (!transfer) {
            const [fallbackTransfers] = await pool.query(
              'SELECT * FROM transfer_numbers WHERE user_id = ? LIMIT 1', [userId]
            );
            transfer = fallbackTransfers[0];
          }
        }
        
        if (!provider || !greeting || !transfer) {
          return { 
            error: true, 
            message: 'Missing required resources for campaign',
            missingResources: {
              provider: !provider,
              greeting: !greeting,
              transfer: !transfer
            }
          };
        }
        
        // Generate optimized configuration
        const configText = `
; ===============================================
; Campaign: ${campaign.title} (ID: ${campaign.id}) - OPTIMIZED
; ===============================================

; SIP Provider Configuration (${provider.name})
; --------------------------
[${provider.name}]
type=peer
host=${provider.host}
port=${provider.port || '5060'}
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
; Set variables for easier management
exten => s,n,Set(GREETING=${greeting.url || 'greeting'})
exten => s,n,Set(TRANSFER_NUMBER=${transfer.phone_number || ''})
exten => s,n,Set(CAMPAIGN_ID=${campaign.id})
exten => s,n,Set(USER_ID=${userId})
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message with error handling
exten => s,n,TrySystem(test -f \${GREETING})
exten => s,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?play:backup_greeting)
exten => s,n(play),Playback(\${GREETING})
exten => s,n,Goto(wait_input)
exten => s,n(backup_greeting),NoOp(Greeting file not found, using backup)
exten => s,n,Playback(hello-world)
; Wait for keypress with extended timeout
exten => s,n(wait_input),WaitExten(5)
; If no keypress, hang up gracefully
exten => s,n,NoOp(No input received, ending call)
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent with intelligent routing
exten => 1,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => 1,n,Set(RETRY_COUNT=0)
exten => 1,n(retry),Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => 1,n,GotoIf($[${DIALSTATUS} = BUSY]?busy:unavailable)
exten => 1,n(busy),NoOp(Transfer destination busy)
exten => 1,n,Playback(busy-please-try-again)
exten => 1,n,Goto(increment)
exten => 1,n(unavailable),NoOp(Transfer destination unavailable)  
exten => 1,n,Playback(sorry-try-again-later)
exten => 1,n(increment),Set(RETRY_COUNT=$[${RETRY_COUNT} + 1])
exten => 1,n,GotoIf($[${RETRY_COUNT} < 3]?retry:fail)
exten => 1,n(fail),NoOp(Failed to transfer after ${RETRY_COUNT} attempts)
exten => 1,n,Hangup()

; Handle other keypresses
exten => _X,1,Playback(invalid-entry)
exten => _X,n,Goto(s,wait_input)
        `.trim();
        
        return { config: configText };
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    });
    
    if (config.error) {
      return res.status(400).json(config);
    }
    
    res.status(200).json(config);
  } catch (error) {
    console.error('Error generating campaign Asterisk configuration:', error);
    res.status(500).json({ error: true, message: 'Error generating campaign Asterisk configuration' });
  }
});

// Periodically clean up the cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of configCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      configCache.delete(key);
    }
  }
}, 15 * 60 * 1000); // Clean up every 15 minutes

module.exports = router;
