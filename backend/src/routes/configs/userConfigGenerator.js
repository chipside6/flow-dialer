
const { pool } = require('../../config/database');
const { getCachedOrGenerate } = require('./cacheService');

// Generates and returns Asterisk configuration for a specific user
const getUserConfig = async (req, res) => {
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
};

module.exports = { getUserConfig };
